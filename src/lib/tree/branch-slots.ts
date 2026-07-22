/**
 * Điểm gắn ảnh trên tán + thân — giữ khoảng cách, rải xuống thân.
 * FOLIAGE_CLUSTERS = vùng vẽ SVG tán; PHOTO_CLUSTERS = tán + thân để gắn ảnh.
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

/** Nhánh / thân thấp hơn — chỉ gắn ảnh, không vẽ tán SVG */
const TRUNK_PHOTO_CLUSTERS: Cluster[] = [
  { cx: 0.38, cy: 0.5, rx: 0.08, ry: 0.055, weight: 0.75 },
  { cx: 0.5, cy: 0.48, rx: 0.07, ry: 0.05, weight: 0.7 },
  { cx: 0.62, cy: 0.5, rx: 0.08, ry: 0.055, weight: 0.75 },
  { cx: 0.42, cy: 0.58, rx: 0.07, ry: 0.05, weight: 0.65 },
  { cx: 0.58, cy: 0.58, rx: 0.07, ry: 0.05, weight: 0.65 },
  { cx: 0.5, cy: 0.62, rx: 0.06, ry: 0.045, weight: 0.55 },
  { cx: 0.46, cy: 0.68, rx: 0.05, ry: 0.04, weight: 0.4 },
  { cx: 0.54, cy: 0.68, rx: 0.05, ry: 0.04, weight: 0.4 },
];

const PHOTO_CLUSTERS: Cluster[] = [...FOLIAGE_CLUSTERS, ...TRUNK_PHOTO_CLUSTERS];

const Y_MIN = 0.06;
const Y_MAX = 0.7;
const X_MIN = 0.04;
const X_MAX = 0.96;

export function minDistForCount(count: number): number {
  if (count <= 40) return 0.055;
  if (count <= 100) return 0.045;
  if (count <= 250) return 0.035;
  if (count <= 500) return 0.028;
  return 0.022;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
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

function makeSlot(x: number, y: number, rand: () => number, count: number): LeafSlot {
  const distFromCenter = Math.hypot(x - 0.5, y - 0.28);
  const density =
    count <= 80 ? 1 : Math.max(0.72, Math.sqrt(80 / count));
  return {
    x,
    y,
    rotation: (rand() - 0.5) * 16,
    scale: (0.95 + rand() * 0.18 - distFromCenter * 0.12) * density,
  };
}

/** Lưới không gian — kiểm tra minDist O(1) trung bình */
class DistGrid {
  private readonly cell: number;
  private readonly map = new Map<string, { x: number; y: number }[]>();

  constructor(minDist: number) {
    this.cell = Math.max(minDist, 0.01);
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

function tryPlace(
  cluster: Cluster,
  rand: () => number,
  grid: DistGrid,
  minDist: number,
  count: number,
  slots: LeafSlot[]
): boolean {
  const angle = rand() * Math.PI * 2;
  const r = Math.sqrt(rand());
  const x = cluster.cx + Math.cos(angle) * r * cluster.rx;
  const y = cluster.cy + Math.sin(angle) * r * cluster.ry;

  if (!inEllipse(x, y, cluster.cx, cluster.cy, cluster.rx, cluster.ry))
    return false;
  if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) return false;
  if (grid.tooClose(x, y, minDist)) return false;

  slots.push(makeSlot(x, y, rand, count));
  grid.add(x, y);
  return true;
}

/**
 * Sinh slot ảnh trên tán + thân — luôn giữ khoảng cách tối thiểu.
 */
export function generatePhotoSlotsOnTree(count: number, seed = 42): LeafSlot[] {
  if (count <= 0) return [];

  const rand = seededRandom(seed);
  const minDist = minDistForCount(count);
  const grid = new DistGrid(minDist);
  const slots: LeafSlot[] = [];
  const totalWeight = PHOTO_CLUSTERS.reduce((s, c) => s + c.weight, 0);

  for (const cluster of PHOTO_CLUSTERS) {
    const n = Math.max(
      1,
      Math.round((count * cluster.weight) / totalWeight)
    );
    let placed = 0;
    let attempts = 0;
    const maxAttempts = n * 40;

    while (placed < n && slots.length < count && attempts < maxAttempts) {
      attempts++;
      if (tryPlace(cluster, rand, grid, minDist, count, slots)) placed++;
    }
  }

  // Lấp đủ count: chỉ nới nhẹ minDist (không để ảnh đè mạnh)
  const relaxFloor = Math.max(0.02, minDist * 0.85);
  let relax = minDist;
  let guard = 0;
  while (slots.length < count && guard < count * 120) {
    guard++;
    if (guard % 150 === 0) relax = Math.max(relaxFloor, relax * 0.95);
    const cluster = PHOTO_CLUSTERS[guard % PHOTO_CLUSTERS.length];
    tryPlace(cluster, rand, grid, relax, count, slots);
  }

  // Fallback cuối: spiral quanh thân nếu vẫn thiếu (hiếm)
  let spiral = 0;
  while (slots.length < count && spiral < count * 40) {
    spiral++;
    const t = spiral * 0.37;
    const ring = 0.035 + (spiral % 50) * 0.005;
    const x = 0.5 + Math.cos(t) * ring;
    const y = 0.18 + (spiral % 60) * 0.0085;
    const cx = Math.min(X_MAX, Math.max(X_MIN, x));
    const cy = Math.min(Y_MAX, Math.max(Y_MIN, y));
    if (grid.tooClose(cx, cy, relaxFloor)) continue;
    slots.push(makeSlot(cx, cy, rand, count));
    grid.add(cx, cy);
  }

  return slots.slice(0, count).sort((a, b) => a.y - b.y);
}

/** Export vùng tán cho vẽ SVG */
export { FOLIAGE_CLUSTERS };
