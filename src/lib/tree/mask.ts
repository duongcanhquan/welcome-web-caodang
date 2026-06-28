/**
 * Mask tán cây hình vòm (dome) — lá phân bố thành tán tròn tự nhiên.
 */

export interface MaskGrid {
  cols: number;
  rows: number;
  cells: boolean[][];
}

const BASE_COLS = 64;
const BASE_ROWS = 64;

/** Vòm cây: elip tròn, phần đáy thu hẹp nối thân */
function inTreeCrown(nx: number, ny: number): boolean {
  const cx = 0.5;
  const cy = 0.46;
  const rx = 0.47;
  const ry = 0.44;

  const dx = (nx - cx) / rx;
  const dy = (ny - cy) / ry;
  const ellipse = dx * dx + dy * dy;

  if (ellipse > 1) return false;

  // Đáy tán: chỉ giữ vùng hẹp quanh trục thân
  if (ny > 0.72) {
    const taper = 1 - (ny - 0.72) / 0.28;
    return Math.abs(nx - cx) < 0.14 * taper + 0.02;
  }

  return true;
}

/** @deprecated Giữ cho tương thích — dùng createTreeCrownMask */
function inHeart(nx: number, ny: number): boolean {
  const x = nx * 2 - 1;
  const y = 1 - ny * 2;
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0.02;
}

export function createTreeCrownMask(cols: number, rows: number): MaskGrid {
  const cells: boolean[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      const nx = (c + 0.5) / cols;
      const ny = (r + 0.5) / rows;
      row.push(inTreeCrown(nx, ny));
    }
    cells.push(row);
  }

  return { cols, rows, cells };
}

/** Giữ export cũ — alias vòm cây */
export function createHeartMask(cols: number, rows: number): MaskGrid {
  return createTreeCrownMask(cols, rows);
}

export function scaleMaskToTarget(targetOn: number): MaskGrid {
  let best = createTreeCrownMask(BASE_COLS, BASE_ROWS);
  let bestDiff = Infinity;

  for (let scale = 0.5; scale <= 2.5; scale += 0.08) {
    const cols = Math.max(16, Math.round(BASE_COLS * scale));
    const rows = Math.max(16, Math.round(BASE_ROWS * scale));
    const mask = createTreeCrownMask(cols, rows);
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
