/**
 * Kích thước ảnh lá — giữ to như cũ (~52px).
 * Khoảng cách tâm gắn với đường kính ảnh: sát được, không đè.
 */

const CANVAS_W = 900;

export function computeBaseLeafSize(
  photoCount: number,
  opts: { mini?: boolean; presentation?: boolean } = {}
): number {
  if (opts.mini) return 28;
  // Gần như cố định như trước; chỉ giảm rất nhẹ khi cực đông
  const n = Math.max(1, photoCount);
  let base = 52;
  if (n > 400) {
    base = 52 * Math.sqrt(400 / n);
  }
  const clamped = Math.min(52, Math.max(44, base));
  if (opts.presentation) return Math.min(58, Math.round(clamped * 1.1));
  return Math.round(clamped);
}

/**
 * Khoảng cách tâm tối thiểu (norm 0–1) = gần đúng đường kính ảnh.
 * * 1.02 → sát nhau được, không đè lên nhau.
 */
export function minDistForLeafVisual(
  baseLeafSize: number,
  avgScale = 1
): number {
  const diameterNorm = (baseLeafSize * avgScale) / CANVAS_W;
  // 1% — sát nhau được, không đè
  return diameterNorm * 1.01;
}

export function minDistForCount(count: number): number {
  return minDistForLeafVisual(computeBaseLeafSize(count));
}

export function leafHitRadiusMultiplier(baseLeafSize: number): number {
  if (baseLeafSize <= 40) return 1.65;
  return 1.45;
}
