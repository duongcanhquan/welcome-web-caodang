/**
 * Điểm gắn ảnh — to như cũ, sát được nhưng không đè (minDist ≈ đường kính ảnh).
 * FOLIAGE_CLUSTERS chỉ dùng vẽ SVG tán.
 */

import type { LeafSlot } from "./types";
import {
  minDistForCount as minDistForCountFromSize,
  minDistForLeafVisual,
} from "./leaf-size";

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
const BASE_PX = 52;

/** Re-export — khoảng cách ≈ đường kính ảnh (sátt, không đè) */
export function minDistForCount(count: number): number {
  return minDistForCountFromSize(count);
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

function inTreeSilhouette(x: number, y: number): boolean {
  if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) return false;
  if (inEllipse(x, y, 0.5, 0.28, 0.49, 0.3)) return true;
  if (inEllipse(x, y, 0.5, 0.48, 0.36, 0.16)) return true;
  if (inEllipse(x, y, 0.5, 0.6, 0.18, 0.12)) return true;
  if (inEllipse(x, y, 0.5, 0.68, 0.11, 0.07)) return true;
  return false;
}

/** scale sao cho đường kính vẽ ≤ packMinDist → không đè */
function makeSlot(
  x: number,
  y: number,
  rand: () => number,
  packMinDist: number
): LeafSlot {
  const distFromCenter = Math.hypot(x - 0.5, y - 0.3);
  const natural = 0.92 + rand() * 0.12 - distFromCenter * 0.06;
  const maxScale = (packMinDist * 900) / BASE_PX * 0.995;
  return {
    x,
    y,
    rotation: (rand() - 0.5) * 14,
    scale: Math.min(Math.max(0.55, natural), maxScale),
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
      const jx = x + (rand() - 0.5) * dx * 0.08;
      const jy = y + (rand() - 0.5) * dy * 0.08;
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

function packAtDistance(
  count: number,
  minDist: number,
  seed: number
): { x: number; y: number }[] {
  const candidates = buildCandidates(minDist * 0.9, seed, count * 12);
  return pickWithMinDist(candidates, count, minDist, seed + 3);
}

/**
 * Sinh slot ảnh to, phân bố đều — tâm cách ≥ đường kính ảnh (không đè).
 * Nếu không đủ chỗ ở size lớn, hạ nhẹ khoảng cách (và scale) tới sàn ~44px.
 * Có thể trả về ít hơn `count` nếu tán đã đầy — phần dư thành lá rụng ở build-layout.
 */
export function generatePhotoSlotsOnTree(count: number, seed = 42): LeafSlot[] {
  if (count <= 0) return [];

  const rand = seededRandom(seed);
  const preferred = minDistForCount(count);
  const floor = minDistForLeafVisual(44);

  let minDist = preferred;
  let bestPoints: { x: number; y: number }[] = [];
  let bestDist = preferred;

  for (let attempt = 0; attempt < 18; attempt++) {
    const picked = packAtDistance(count, minDist, seed + attempt * 23);
    if (picked.length >= count) {
      bestPoints = picked.slice(0, count);
      bestDist = minDist;
      break;
    }
    if (picked.length > bestPoints.length) {
      bestPoints = picked;
      bestDist = minDist;
    }
    const next = minDist * 0.93;
    if (next < floor) {
      // Gói tối đa ở sàn
      const maxPack = packAtDistance(count * 2, floor, seed + 900);
      if (maxPack.length > bestPoints.length) {
        bestPoints = maxPack.slice(0, count);
        bestDist = floor;
      }
      break;
    }
    minDist = next;
  }

  return bestPoints
    .slice(0, count)
    .map((p) => makeSlot(p.x, p.y, rand, bestDist))
    .sort((a, b) => a.y - b.y);
}

/** Export vùng tán cho vẽ SVG */
export { FOLIAGE_CLUSTERS };
