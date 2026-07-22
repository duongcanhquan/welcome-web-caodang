/**
 * Kích thước ảnh lá theo mật độ — đông thì nhỏ lại để ít đè, vẫn bấm được.
 */
export function computeBaseLeafSize(
  photoCount: number,
  opts: { mini?: boolean; presentation?: boolean } = {}
): number {
  if (opts.mini) return 28;
  const n = Math.max(1, photoCount);
  const density = Math.sqrt(80 / Math.max(n, 80));
  const base = 52 * density;
  const clamped = Math.min(52, Math.max(28, base));
  return Math.round(opts.presentation ? clamped * 1.08 : clamped);
}

/** Hệ số hit-test — ảnh nhỏ cần vùng chạm rộng hơn một chút */
export function leafHitRadiusMultiplier(baseLeafSize: number): number {
  if (baseLeafSize <= 32) return 1.75;
  if (baseLeafSize <= 40) return 1.6;
  return 1.45;
}
