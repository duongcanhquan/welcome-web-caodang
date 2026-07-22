/**
 * Camera fit cho canvas cây cố định (thường 900×1100).
 *
 * - Mobile / portrait / narrow: cover — full màn, ưu tiên giữ tán.
 * - Desktop landscape (kể cả present=1): contain — thấy cả cây, có padding
 *   vì tán SVG/ảnh hơi tràn ngoài viewBox.
 */
export type TreeCameraFit = {
  scale: number;
  panX: number;
  panY: number;
  mode: "cover" | "contain";
};

/** Lề contain — tán ellipse/ảnh mép không bị cắt bởi overflow-hidden. */
const CONTAIN_PAD = 0.92;

/** Cover: phần overflow kéo lên (0 = neo đáy cắt tán, 1 = neo đỉnh cắt gốc). */
const COVER_CANOPY_BIAS = 0.22;

export function computeTreeCamera(
  vw: number,
  vh: number,
  canvasW: number,
  canvasH: number
): TreeCameraFit {
  const scaleW = vw / canvasW;
  const scaleH = vh / canvasH;
  const portrait = vh / vw >= 1.05;
  const narrow = vw < 768;
  const useCover = portrait || narrow;

  if (useCover) {
    const scale = Math.max(scaleW, scaleH);
    const panX = (vw - canvasW * scale) / 2;
    const overflow = canvasH * scale - vh;
    const panY =
      overflow > 0
        ? -overflow * COVER_CANOPY_BIAS
        : (vh - canvasH * scale) / 2;
    return { scale, panX, panY, mode: "cover" };
  }

  const scale = Math.min(scaleW, scaleH) * CONTAIN_PAD;
  const panX = (vw - canvasW * scale) / 2;
  const panY = (vh - canvasH * scale) / 2;
  return { scale, panX, panY, mode: "contain" };
}
