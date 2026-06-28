/**
 * Mask tán cây hình trái tim — bitmap on/off ở độ phân giải cao.
 * Scale mask để thay đổi số ô lá.
 */

export interface MaskGrid {
  cols: number;
  rows: number;
  /** true = nằm trong mask */
  cells: boolean[][];
}

const BASE_COLS = 64;
const BASE_ROWS = 64;

/** Kiểm tra điểm (nx, ny) trong trái tim chuẩn hoá 0..1 */
function inHeart(nx: number, ny: number): boolean {
  // Công thức trái tim: (x^2+y^2-1)^3 - x^2*y^3 <= 0
  const x = nx * 2 - 1;
  const y = 1 - ny * 2;
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0.02;
}

/** Tạo mask trái tim với kích thước cols x rows */
export function createHeartMask(cols: number, rows: number): MaskGrid {
  const cells: boolean[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      const nx = (c + 0.5) / cols;
      const ny = (r + 0.5) / rows;
      // Thu hẹp phía trên để giống tán cây hơn trái tim đầy
      const canopyNy = (ny - 0.05) / 0.75;
      row.push(canopyNy >= 0 && canopyNy <= 1 && inHeart(nx, canopyNy));
    }
    cells.push(row);
  }

  return { cols, rows, cells };
}

/** Scale mask: chọn cols/rows sao cho số ô on ≈ target */
export function scaleMaskToTarget(targetOn: number): MaskGrid {
  let best = createHeartMask(BASE_COLS, BASE_ROWS);
  let bestDiff = Infinity;

  for (let scale = 0.5; scale <= 2.5; scale += 0.08) {
    const cols = Math.max(16, Math.round(BASE_COLS * scale));
    const rows = Math.max(16, Math.round(BASE_ROWS * scale));
    const mask = createHeartMask(cols, rows);
    const onCount = countOnCells(mask);
    const diff = Math.abs(onCount - targetOn);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = mask;
    }
  }

  return best;
}

export function countOnCells(mask: MaskGrid): number {
  let n = 0;
  for (const row of mask.cells) {
    for (const cell of row) {
      if (cell) n++;
    }
  }
  return n;
}

/** Lấy danh sách tọa độ normalized (0..1) của các ô on trong mask */
export function getMaskPoints(mask: MaskGrid): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let r = 0; r < mask.rows; r++) {
    for (let c = 0; c < mask.cols; c++) {
      if (mask.cells[r][c]) {
        points.push({
          x: (c + 0.5) / mask.cols,
          y: (r + 0.5) / mask.rows,
        });
      }
    }
  }
  return points;
}
