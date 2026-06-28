/** Số bậc thầy Pythagoras — không rút gọn thêm */
export const MASTER_NUMBERS = [11, 22, 33] as const;
export type MasterNumber = (typeof MASTER_NUMBERS)[number];
export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

export function isMasterNumber(n: number): n is MasterNumber {
  return (MASTER_NUMBERS as readonly number[]).includes(n);
}

/**
 * Rút gọn số: cộng dồn chữ số đến 1 chữ số,
 * NGOẠI TRỪ dừng ở 11, 22, 33.
 */
export function reduceNumber(n: number): NumerologyNumber {
  if (n <= 0) return 1;

  let current = Math.abs(Math.floor(n));

  while (current > 9) {
    if (isMasterNumber(current)) {
      return current;
    }
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return current as NumerologyNumber;
}

/** Rút gọn từng thành phần ngày/tháng/năm riêng biệt */
export function reduceComponent(value: number): NumerologyNumber {
  return reduceNumber(value);
}
