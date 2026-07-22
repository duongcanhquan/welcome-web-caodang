/**
 * Điểm gắn ảnh — phân bố đều trên tán rộng + thân, khoảng cách rõ để dễ bấm.
 * FOLIAGE_CLUSTERS chỉ dùng vẽ SVG tán.
 */

import type { LeafSlot } from "./types";

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

const Y_MIN = 0.05;
const Y_MAX = 0.72;
const X_MIN = 0.02;
const X_MAX = 0.98;

/** Mục tiêu khoảng cách — càng đông càng nhỏ dần nhưng vẫn có khe */
export function minDistForCount(count: number): number {
  if (count <= 40) return 0.08;
  if (count <= 80) return 0.068;
  if (count <= 150) return 0.052;
  if (count <= 300) return 0.042;
  if (count <= 500) return 0.034;
  return 0.028;
}

const ABSOLUTE_FLOOR = 0.025;

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

/** Silhouette rộng gần full tán + thân */
function inTreeSilhouette(x: number, y: number): boolean {
  if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) return false;
  if (inEllipse(x, y, 0.5, 0.28, 0.49, 0.3)) return true;
  if (inEllipse(x, y, 0.5, 0.48, 0.36, 0.16)) return true;
  if (inEllipse(x, y, 0.5, 0.6, 0.18, 0.12)) return true;
  if (inEllipse(x, y, 0.5, 0.68, 0.11, 0.07)) return true;
  return false;
}

function makeSlot(
  x: number,
  y: number,
  rand: () => number,
  count: number
): LeafSlot {
  const distFromCenter = Math.hypot(x - 0.5, y - 0.3);
  const density = count <= 60 ? 1 : Math.max(0.52, Math.sqrt(50 / count));
  return {
    x,
    y,
    rotation: (rand() - 0.5) * 14,
    scale: (0.86 + rand() * 0.12 - distFromCenter * 0.08) * density,
  };
}

class DistGrid {
  private readonly cell: number;
  private readonly map = new Map<string, { x: number; y: number }[]>();

  constructor(minDist: number) {
    this.cell = Math.max(minDist, 0.008);
  }

  private key(x: number, y: number): string {
    return `${Math.floor(x / this.cell)},${Math.floor(y / this.cell)}`;
  }

  tooClose(x: number, y: number, minDist: number): boolean {
    const cx = Math.floor(x / this.cell);
    const cy = Math.floor(y / this.cell);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const bucket = this.map.get(`${cx + dx},${cy + dy}`);
        if (!bucket) continue;
        for (const p of bucket) {
          if (Math.hypot(p.x - x, p.y - y) < minDist) return true;
        }
      }
    }
    return false;
  }

  add(x: number, y: number) {
    const k = this.key(x, y);
    const bucket = this.map.get(k);
    if (bucket) bucket.push({ x, y });
    else this.map.set(k, [{ x, y }]);
  }
}

function buildCandidates(spacing: number, seed: number, extra: number) {
  const rand = seededRandom(seed);
  const dx = spacing;
  const dy = spacing * 0.866;
  const out: { x: number; y: number }[] = [];
  let row = 0;

  for (let y = Y_MIN; y <= Y_MAX + 1e-9; y += dy, row++) {
    const xOff = (row % 2) * (dx * 0.5);
    for (let x = X_MIN + xOff; x <= X_MAX + 1e-9; x += dx) {
      const jx = x + (rand() - 0.5) * dx * 0.1;
      const jy = y + (rand() - 0.5) * dy * 0.1;
      if (inTreeSilhouette(jx, jy)) out.push({ x: jx, y: jy });
    }
  }

  for (let i = 0; i < extra; i++) {
    const x = X_MIN + rand() * (X_MAX - X_MIN);
    const y = Y_MIN + rand() * (Y_MAX - Y_MIN);
    if (inTreeSilhouette(x, y)) out.push({ x, y });
  }
  return out;
}

function pickWithMinDist(
  candidates: { x: number; y: number }[],
  count: number,
  minDist: number,
  seed: number
): { x: number; y: number }[] {
  const rand = seededRandom(seed);
  const arr = candidates.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }

  const grid = new DistGrid(minDist);
  const picked: { x: number; y: number }[] = [];
  for (const p of arr) {
    if (!p) continue;
    if (picked.length >= count) break;
    if (grid.tooClose(p.x, p.y, minDist)) continue;
    grid.add(p.x, p.y);
    picked.push(p);
  }
  return picked;
}

/**
 * Sinh đúng `count` slot, ưu tiên khoảng cách lớn, phân bố đều trên tán rộng.
 */
export function generatePhotoSlotsOnTree(count: number, seed = 42): LeafSlot[] {
  if (count <= 0) return [];

  const rand = seededRandom(seed);
  let minDist = minDistForCount(count);
  let best: { x: number; y: number }[] = [];

  for (let attempt = 0; attempt < 22; attempt++) {
    const candidates = buildCandidates(
      Math.max(ABSOLUTE_FLOOR * 0.9, minDist * 0.85),
      seed + attempt * 17,
      count * 10
    );
    const picked = pickWithMinDist(
      candidates,
      count,
      minDist,
      seed + attempt * 41
    );
    if (picked.length >= count) {
      best = picked.slice(0, count);
      break;
    }
    if (picked.length > best.length) best = picked;
    minDist = Math.max(ABSOLUTE_FLOOR, minDist * 0.9);
  }

  if (best.length < count) {
    const candidates = buildCandidates(
      ABSOLUTE_FLOOR * 0.8,
      seed + 777,
      count * 20
    );
    best = pickWithMinDist(candidates, count, ABSOLUTE_FLOOR, seed + 888);
  }

  const slots: LeafSlot[] = best.slice(0, count).map((p) =>
    makeSlot(p.x, p.y, rand, count)
  );

  // Bảo đảm đủ count — xoắn ốc rộng vẫn giữ ABSOLUTE_FLOOR
  const grid = new DistGrid(ABSOLUTE_FLOOR);
  for (const s of slots) grid.add(s.x, s.y);
  let n = 0;
  while (slots.length < count && n < count * 200) {
    n++;
    const t = n * 0.45;
    const ring = 0.04 + (n % 90) * 0.0055;
    const x = Math.min(X_MAX, Math.max(X_MIN, 0.5 + Math.cos(t) * ring * 1.85));
    const y = Math.min(Y_MAX, Math.max(Y_MIN, 0.08 + (n % 80) * 0.0078));
    if (!inTreeSilhouette(x, y)) continue;
    if (grid.tooClose(x, y, ABSOLUTE_FLOOR)) continue;
    grid.add(x, y);
    slots.push(makeSlot(x, y, rand, count));
  }

  // Nới sàn dần cho tới khi đủ chỗ (ưu tiên vẫn có khe; không bỏ sót slot)
  let soft = ABSOLUTE_FLOOR;
  while (slots.length < count && soft >= 0.012) {
    soft *= 0.88;
    for (let y = Y_MIN; y <= Y_MAX + 1e-9 && slots.length < count; y += soft) {
      for (
        let x = X_MIN;
        x <= X_MAX + 1e-9 && slots.length < count;
        x += soft
      ) {
        if (!inTreeSilhouette(x, y)) continue;
        if (grid.tooClose(x, y, soft)) continue;
        grid.add(x, y);
        slots.push(makeSlot(x, y, rand, count));
      }
    }
  }

  // Cùng lắm: xếp zigzag trong khung tán (vẫn tránh đè hoàn toàn nếu được)
  let i = 0;
  while (slots.length < count) {
    const col = i % 24;
    const row = Math.floor(i / 24);
    const x = X_MIN + ((col + 0.5) / 24) * (X_MAX - X_MIN);
    const y = Y_MIN + ((row + 0.5) / 36) * (Y_MAX - Y_MIN);
    i++;
    if (i > count * 40) break;
    if (grid.tooClose(x, y, 0.01)) continue;
    grid.add(x, y);
    slots.push(makeSlot(x, y, rand, count));
  }

  return slots.slice(0, count).sort((a, b) => a.y - b.y);
}

/** Export vùng tán cho vẽ SVG */
export { FOLIAGE_CLUSTERS };
