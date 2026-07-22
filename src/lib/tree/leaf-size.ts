/**
 * Kích thước ảnh lá theo mật độ — đông thì nhỏ rõ để không đè nhau.
 */
export function computeBaseLeafSize(
  photoCount: number,
  opts: { mini?: boolean; presentation?: boolean } = {}
): number {
  if (opts.mini) return 22;
  const n = Math.max(1, photoCount);
  const density = Math.sqrt(45 / Math.max(n, 45));
  const base = 44 * density;
  const clamped = Math.min(44, Math.max(20, base));
  return Math.round(opts.presentation ? clamped * 1.06 : clamped);
}

/** Hệ số hit-test — ảnh nhỏ cần vùng chạm rộng hơn */
export function leafHitRadiusMultiplier(baseLeafSize: number): number {
  if (baseLeafSize <= 26) return 1.9;
  if (baseLeafSize <= 34) return 1.7;
  return 1.5;
}
