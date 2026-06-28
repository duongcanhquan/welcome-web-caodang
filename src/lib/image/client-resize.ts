/** Resize ảnh phía client xuống ~512px trước khi upload */
export async function resizeImageClient(
  file: File,
  maxSize = 512
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas không khả dụng"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Không thể nén ảnh"));
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được ảnh"));
    };

    img.src = url;
  });
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
