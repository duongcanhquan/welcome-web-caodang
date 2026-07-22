/**
 * Điểm gắn ảnh — size cố định, rải đều khắp tán + cành + thân, không chồng.
 * Khoảng cách tính theo pixel (canvas 900×1100) để không đè thật trên màn hình.
 */

import type { LeafSlot } from "./types";
import { computeBaseLeafSize, minDistForCount as minDistNorm } from "./leaf-size";

type Cluster = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  weight: number;
};

/** Vùng tán lá (elip) — dùng vẽ SVG */
const FOLIAGE_CLUSTERS: Cluster[] = [
  { cx: 0.1, cy: 0.36, rx: 0.085, ry: 0.07, weight: 1.0 },
  { cx: 0.2, cy: 0.22, rx: 0.1, ry: 0.085, weight: 1.2 },
  { cx: 0.32, cy: 0.14, rx: 0.1, ry: 0.08, weight: 1.1 },
  { cx: 0.44, cy: 0.1, rx: 0.09, ry: 0.07, weight: 0.9 },
  { cx: 0.56, cy: 0.1, rx: 0.09, ry: 0.07, weight: 0.9 },
  { cx: 0.68, cy: 0.14, rx: 0.1, ry: 0.08, weight: 1.1 },
  { cx: 0.8, cy: 0.22, rx: 0.1, ry: 0.085, weight: 1.2 },
  { cx: 0.9, cy: 0.36, rx: 0.085, ry: 0.07, weight: 1.0 },
  { cx: 0.26, cy: 0.3, rx: 0.11, ry: 0.08, weight: 1.0 },
  { cx: 0.5, cy: 0.18, rx: 0.1, ry: 0.075, weight: 1.0 },
  { cx: 0.74, cy: 0.3, rx: 0.11, ry: 0.08, weight: 1.0 },
  { cx: 0.36, cy: 0.4, rx: 0.09, ry: 0.065, weight: 0.85 },
  { cx: 0.64, cy: 0.4, rx: 0.09, ry: 0.065, weight: 0.85 },
  { cx: 0.5, cy: 0.32, rx: 0.07, ry: 0.055, weight: 0.7 },
];

const CANVAS_W = 900;
const CANVAS_H = 1100;

const Y_MIN = 0.06;
const Y_MAX = 0.7;
const X_MIN = 0.04;
const X_MAX = 0.96;

/** Re-export cho test */
export function minDistForCount(count: number): number {
  return minDistNorm(count);
}

function seededRandom(seed: number): () => number {
  let s = Math.floor(Math.abs(seed)) % 2147483647;
  if (s === 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function inEllipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

/**
 * Silhouette rộng: tán full + vai cành + thân giữa.
 * Ưu tiên phủ chỗ trống mà ảnh đang bỏ sót.
 */
function inTreeSilhouette(x: number, y: number): boolean {
  if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) return false;
  // Tán rộng
  if (inEllipse(x, y, 0.5, 0.26, 0.46, 0.26)) return true;
  // Vai / cành ngang
  if (inEllipse(x, y, 0.28, 0.38, 0.2, 0.12)) return true;
  if (inEllipse(x, y, 0.72, 0.38, 0.2, 0.12)) return true;
  if (inEllipse(x, y, 0.5, 0.4, 0.34, 0.12)) return true;
  // Thân + cành thấp
  if (inEllipse(x, y, 0.5, 0.52, 0.22, 0.1)) return true;
  if (inEllipse(x, y, 0.42, 0.58, 0.12, 0.08)) return true;
  if (inEllipse(x, y, 0.58, 0.58, 0.12, 0.08)) return true;
  if (inEllipse(x, y, 0.5, 0.64, 0.1, 0.07)) return true;
  return false;
}

/** Khoảng cách pixel giữa hai tâm */
function pixelDist(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.hypot((a.x - b.x) * CANVAS_W, (a.y - b.y) * CANVAS_H);
}

function makeSlot(
  x: number,
  y: number,
  rand: () => number
): LeafSlot {
  return {
    x,
    y,
    rotation: (rand() - 0.5) * 12,
    // Size cố định — TreeCanvas dùng baseLeafSize × scale
    scale: 0.96 + rand() * 0.08,
  };
}

/**
 * Lưới lục giác theo pixel: bước ≈ đường kính ảnh × gap.
 * Lấy đều trên toàn silhouette (không dồn đỉnh tán).
 */
function buildEvenLattice(sizePx: number, gap: number): { x: number; y: number }[] {
  const stepX = (sizePx / CANVAS_W) * gap;
  const stepY = (sizePx / CANVAS_H) * gap * 0.866;
  const out: { x: number; y: number }[] = [];
  let row = 0;

  for (let y = Y_MIN; y <= Y_MAX + 1e-9; y += stepY, row++) {
    const xOff = (row % 2) * (stepX * 0.5);
    for (let x = X_MIN + xOff; x <= X_MAX + 1e-9; x += stepX) {
      if (inTreeSilhouette(x, y)) out.push({ x, y });
    }
  }
  return out;
}

/** Chọn đều count điểm từ lattice đã cách nhau */
function pickEvenly(
  lattice: { x: number; y: number }[],
  count: number
): { x: number; y: number }[] {
  if (lattice.length <= count) return lattice.slice();
  // Duyệt theo hàng (y rồi x) rồi lấy cách đều → phủ cả thân/cành/tán
  const sorted = [...lattice].sort((a, b) =>
    a.y === b.y ? a.x - b.x : a.y - b.y
  );
  const picked: { x: number; y: number }[] = [];
  const step = sorted.length / count;
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx = Math.min(sorted.length - 1, Math.floor(i * step + step * 0.5));
    // Tránh trùng index
    while (used.has(idx) && idx < sorted.length - 1) idx++;
    while (used.has(idx) && idx > 0) idx--;
    used.add(idx);
    picked.push(sorted[idx]!);
  }
  return picked;
}

/**
 * Greedy bổ sung nếu lattice thiếu — vẫn tôn trọng khoảng cách pixel.
 */
function fillRemaining(
  current: { x: number; y: number }[],
  need: number,
  minPx: number,
  seed: number
): { x: number; y: number }[] {
  if (current.length >= need) return current;
  const rand = seededRandom(seed);
  const out = current.slice();

  for (let attempt = 0; attempt < need * 80 && out.length < need; attempt++) {
    const x = X_MIN + rand() * (X_MAX - X_MIN);
    const y = Y_MIN + rand() * (Y_MAX - Y_MIN);
    if (!inTreeSilhouette(x, y)) continue;
    const p = { x, y };
    if (out.some((o) => pixelDist(o, p) < minPx)) continue;
    out.push(p);
  }
  return out;
}

/**
 * Sinh slot: size giữ nguyên, rải đều, không chồng (theo pixel).
 */
export function generatePhotoSlotsOnTree(count: number, seed = 42): LeafSlot[] {
  if (count <= 0) return [];

  const rand = seededRandom(seed);
  const sizePx = computeBaseLeafSize(count);
  // gap 1.08 = sát nhưng không đè; hạ dần nếu thiếu chỗ
  let gap = 1.08;
  let points: { x: number; y: number }[] = [];

  for (let attempt = 0; attempt < 12; attempt++) {
    const lattice = buildEvenLattice(sizePx, gap);
    if (lattice.length >= count) {
      points = pickEvenly(lattice, count);
      break;
    }
    points = lattice;
    gap = Math.max(1.0, gap * 0.96);
  }

  const minPx = sizePx * Math.max(1.0, gap * 0.98);
  points = fillRemaining(points, count, minPx, seed + 11);

  // Nếu vẫn thiếu: nới gap xuống 0.95 (hơi sát hơn, vẫn gần như không đè)
  if (points.length < count) {
    gap = 0.95;
    const lattice = buildEvenLattice(sizePx, gap);
    points = pickEvenly(lattice, Math.min(count, lattice.length));
    points = fillRemaining(points, count, sizePx * 0.95, seed + 22);
  }

  return points
    .slice(0, count)
    .map((p) => makeSlot(p.x, p.y, rand))
    .sort((a, b) => a.y - b.y);
}

/** Export vùng tán cho vẽ SVG */
export { FOLIAGE_CLUSTERS };
