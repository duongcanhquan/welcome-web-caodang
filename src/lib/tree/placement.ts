import type { LeafSlot } from "./types";

/** PRNG deterministic theo seed — layout ổn định giữa các lần render */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Jittered grid + phân bố theo bán kính — lá xếp vòm từ trong ra ngoài.
 */
export function placeLeavesNatural(
  points: { x: number; y: number }[],
  seed = 42
): LeafSlot[] {
  const rand = seededRandom(seed);
  const cx = 0.5;
  const cy = 0.46;

  const sorted = [...points].sort((a, b) => {
    const da = Math.hypot(a.x - cx, a.y - cy);
    const db = Math.hypot(b.x - cx, b.y - cy);
    if (Math.abs(da - db) > 0.001) return da - db;
    return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);
  });

  return sorted.map((p) => {
    const jitterX = (rand() - 0.5) * 0.022;
    const jitterY = (rand() - 0.5) * 0.022;
    const dist = Math.hypot(p.x - cx, p.y - cy);
    const depthScale = 0.78 + (1 - Math.min(dist / 0.48, 1)) * 0.32;

    return {
      x: Math.min(0.98, Math.max(0.02, p.x + jitterX)),
      y: Math.min(0.92, Math.max(0.05, p.y + jitterY)),
      rotation: (rand() - 0.5) * 28 + (p.x - cx) * 18,
      scale: (0.8 + rand() * 0.22) * depthScale,
    };
  });
}

/** Chọn số slot mục tiêu từ N người tham gia */
export function computeTargetSlots(
  n: number,
  fillRatio: number,
  leavesMin: number,
  leavesMax: number
): number {
  const raw = Math.ceil(n / Math.max(0.1, fillRatio));
  return Math.min(leavesMax, Math.max(leavesMin, raw));
}

/** Vị trí lá rụng quanh gốc (overflow) */
export function placeFallenLeaves(
  count: number,
  seed = 99
): LeafSlot[] {
  const rand = seededRandom(seed);
  const slots: LeafSlot[] = [];

  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 0.08 + rand() * 0.15;
    slots.push({
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.78 + rand() * 0.06,
      rotation: rand() * 360,
      scale: 0.6 + rand() * 0.3,
    });
  }

  return slots;
}

/** Vị trí lá đệm (filler) — lấp slot trống khi THIẾU người */
export function pickFillerSlots(
  allSlots: LeafSlot[],
  usedCount: number
): LeafSlot[] {
  return allSlots.slice(usedCount);
}
