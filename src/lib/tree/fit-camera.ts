/**
 * Camera fit cho canvas cây cố định (thường 900×1100).
 *
 * Luôn contain + căn giữa: desktop và điện thoại đều thấy đủ tán hai bên
 * và cả cây. Nền trời vẫn phủ full viewport (letterbox không phải màu trống).
 * Padding vì tán SVG/ảnh hơi tràn ngoài viewBox.
 */
export type TreeCameraFit = {
  scale: number;
  panX: number;
  panY: number;
  mode: "contain";
};

/** Lề — tán ellipse/ảnh mép không bị cắt bởi overflow-hidden. */
const CONTAIN_PAD = 0.94;

export function computeTreeCamera(
  vw: number,
  vh: number,
  canvasW: number,
  canvasH: number
): TreeCameraFit {
  const scaleW = vw / canvasW;
  const scaleH = vh / canvasH;
  const scale = Math.min(scaleW, scaleH) * CONTAIN_PAD;
  const panX = (vw - canvasW * scale) / 2;
  const panY = (vh - canvasH * scale) / 2;
  return { scale, panX, panY, mode: "contain" };
}
