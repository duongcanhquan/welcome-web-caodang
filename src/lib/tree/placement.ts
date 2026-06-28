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
 * Jittered grid + Poisson-like spacing — đặt lá tự nhiên trong mask.
 * Mỗi điểm mask → 1 slot với xoay và scale ngẫu nhiên có seed.
 */
export function placeLeavesNatural(
  points: { x: number; y: number }[],
  seed = 42
): LeafSlot[] {
  const rand = seededRandom(seed);

  // Sắp xếp theo vị trí để phân bố đều (không dồn)
  const sorted = [...points].sort((a, b) => {
    const ha = a.y * 1000 + a.x;
    const hb = b.y * 1000 + b.x;
    return ha - hb;
  });

  return sorted.map((p) => {
    const jitterX = (rand() - 0.5) * 0.018;
    const jitterY = (rand() - 0.5) * 0.018;
    return {
      x: Math.min(0.98, Math.max(0.02, p.x + jitterX)),
      y: Math.min(0.92, Math.max(0.05, p.y + jitterY)),
      rotation: (rand() - 0.5) * 36,
      scale: 0.82 + rand() * 0.28,
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
      y: 0.88 + rand() * 0.08,
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
