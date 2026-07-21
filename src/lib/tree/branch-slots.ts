/**
 * Điểm gắn ảnh trên các tán/nhánh — tán rộng, không dồn cụm.
 * ViewBox-normalized 0..1. Fast path khi N lớn.
 */

import type { LeafSlot } from "./types";

/** Vùng tán lá (elip) — rải rộng hai bên */
const FOLIAGE_CLUSTERS = [
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

function makeSlot(
  x: number,
  y: number,
  rand: () => number
): LeafSlot {
  const distFromCenter = Math.hypot(x - 0.5, y - 0.22);
  return {
    x,
    y,
    rotation: (rand() - 0.5) * 16,
    scale: 0.95 + rand() * 0.2 - distFromCenter * 0.15,
  };
}

/** Fast path: rải deterministic theo cụm, không rejection sampling O(n²) */
function generateFast(count: number, seed: number): LeafSlot[] {
  const rand = seededRandom(seed);
  const totalWeight = FOLIAGE_CLUSTERS.reduce((s, c) => s + c.weight, 0);
  const slots: LeafSlot[] = [];

  for (const cluster of FOLIAGE_CLUSTERS) {
    const n = Math.max(
      1,
      Math.round((count * cluster.weight) / totalWeight)
    );
    for (let i = 0; i < n && slots.length < count; i++) {
      const angle = ((i + rand()) / n) * Math.PI * 2;
      const r = Math.sqrt((i + 0.5) / n) * 0.92;
      const x = cluster.cx + Math.cos(angle) * r * cluster.rx;
      const y = cluster.cy + Math.sin(angle) * r * cluster.ry;
      const cx = Math.min(0.96, Math.max(0.04, x));
      const cy = Math.min(0.48, Math.max(0.06, y));
      slots.push(makeSlot(cx, cy, rand));
    }
  }

  while (slots.length < count) {
    const cluster = FOLIAGE_CLUSTERS[slots.length % FOLIAGE_CLUSTERS.length];
    const angle = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.9;
    slots.push(
      makeSlot(
        cluster.cx + Math.cos(angle) * r * cluster.rx,
        cluster.cy + Math.sin(angle) * r * cluster.ry,
        rand
      )
    );
  }

  return slots.slice(0, count).sort((a, b) => a.y - b.y);
}

/** Sinh slot ảnh trên tán — rộng, cách nhau, gắn lên nhánh */
export function generatePhotoSlotsOnTree(count: number, seed = 42): LeafSlot[] {
  if (count <= 0) return [];
  // N lớn: bỏ kiểm tra khoảng cách từng điểm (quá chậm khi chốt / tạo layout)
  if (count > 100) return generateFast(count, seed);

  const rand = seededRandom(seed);
  const totalWeight = FOLIAGE_CLUSTERS.reduce((s, c) => s + c.weight, 0);
  const slots: LeafSlot[] = [];
  const minDist = count > 60 ? 0.04 : 0.055;

  for (const cluster of FOLIAGE_CLUSTERS) {
    const n = Math.max(1, Math.round((count * cluster.weight) / totalWeight));
    let placed = 0;
    let attempts = 0;
    const maxAttempts = n * 25;

    while (placed < n && attempts < maxAttempts) {
      attempts++;
      const angle = rand() * Math.PI * 2;
      const r = Math.sqrt(rand());
      const x = cluster.cx + Math.cos(angle) * r * cluster.rx;
      const y = cluster.cy + Math.sin(angle) * r * cluster.ry;

      if (!inEllipse(x, y, cluster.cx, cluster.cy, cluster.rx, cluster.ry))
        continue;
      if (x < 0.04 || x > 0.96 || y < 0.06 || y > 0.48) continue;

      const tooClose = slots.some(
        (s) => Math.hypot(s.x - x, s.y - y) < minDist
      );
      if (tooClose) continue;

      slots.push(makeSlot(x, y, rand));
      placed++;
    }
  }

  while (slots.length < count) {
    const cluster = FOLIAGE_CLUSTERS[slots.length % FOLIAGE_CLUSTERS.length];
    const angle = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.9;
    slots.push(
      makeSlot(
        cluster.cx + Math.cos(angle) * r * cluster.rx,
        cluster.cy + Math.sin(angle) * r * cluster.ry,
        rand
      )
    );
  }

  return slots.slice(0, count).sort((a, b) => a.y - b.y);
}

/** Export vùng tán cho vẽ SVG */
export { FOLIAGE_CLUSTERS };
