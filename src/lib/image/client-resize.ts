/**
 * Nén/resize ảnh phía client trước khi upload — giảm băng thông & tải server.
 *
 * Mục tiêu: cạnh dài ≤ maxEdge px, JPEG ~0.72–0.82, thường dưới ~250KB.
 */

const DEFAULT_MAX_EDGE = 720;
const TARGET_MAX_BYTES = 280 * 1024; // ~280KB
const MIN_QUALITY = 0.55;

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
  /** Bytes trước khi nén (file gốc) */
  originalBytes: number;
  /** Bytes sau khi nén */
  compressedBytes: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được ảnh — thử JPEG/PNG."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Không thể nén ảnh"));
      },
      "image/jpeg",
      quality
    );
  });
}

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas không khả dụng");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function computeSize(
  srcW: number,
  srcH: number,
  maxEdge: number
): { width: number; height: number } {
  if (srcW <= maxEdge && srcH <= maxEdge) {
    return { width: srcW, height: srcH };
  }
  const ratio = Math.min(maxEdge / srcW, maxEdge / srcH);
  return {
    width: Math.max(1, Math.round(srcW * ratio)),
    height: Math.max(1, Math.round(srcH * ratio)),
  };
}

/**
 * Resize + nén JPEG phía trình duyệt.
 * Tự hạ quality nếu vẫn lớn hơn TARGET_MAX_BYTES.
 */
export async function resizeImageClient(
  file: File,
  maxEdge = DEFAULT_MAX_EDGE
): Promise<Blob> {
  const result = await resizeImageClientDetailed(file, maxEdge);
  return result.blob;
}

/** Bản đầy đủ — có thống kê dung lượng (dùng cho UI) */
export async function resizeImageClientDetailed(
  file: File,
  maxEdge = DEFAULT_MAX_EDGE
): Promise<ResizeResult> {
  if (!file.type.startsWith("image/") && file.type !== "") {
    throw new Error("File không phải ảnh");
  }

  const originalBytes = file.size;
  let canvas: HTMLCanvasElement;
  let width: number;
  let height: number;

  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      ({ width, height } = computeSize(bitmap.width, bitmap.height, maxEdge));
      canvas = drawToCanvas(bitmap, width, height);
      bitmap.close();
    } else {
      const img = await loadImage(file);
      ({ width, height } = computeSize(img.naturalWidth, img.naturalHeight, maxEdge));
      canvas = drawToCanvas(img, width, height);
    }
  } catch {
    const img = await loadImage(file);
    ({ width, height } = computeSize(img.naturalWidth, img.naturalHeight, maxEdge));
    canvas = drawToCanvas(img, width, height);
  }

  let quality = 0.8;
  let blob = await canvasToBlob(canvas, quality);

  // Hạ chất lượng dần nếu vẫn quá lớn
  while (blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - 0.08);
    blob = await canvasToBlob(canvas, quality);
  }

  // Vẫn quá lớn → thu nhỏ thêm một bậc
  if (blob.size > TARGET_MAX_BYTES && maxEdge > 480) {
    return resizeImageClientDetailed(file, Math.round(maxEdge * 0.75));
  }

  return {
    blob,
    width,
    height,
    originalBytes,
    compressedBytes: blob.size,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Lưu token vào localStorage sau khi gửi */
export function saveSubmissionToken(token: string): void {
  try {
    localStorage.setItem("cay_khoa_token", token);
  } catch {
    // private browsing
  }
}

export function getSubmissionToken(): string | null {
  try {
    return localStorage.getItem("cay_khoa_token");
  } catch {
    return null;
  }
}
