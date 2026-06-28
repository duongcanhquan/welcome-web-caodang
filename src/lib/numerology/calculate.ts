import { reduceComponent, reduceNumber, type NumerologyNumber } from "./reduce";

export interface BirthDate {
  day: number;
  month: number;
  year: number;
}

export interface NumerologyResult {
  lifePath: NumerologyNumber;
  birthDay: NumerologyNumber;
  personalYear: NumerologyNumber;
  /** Chi tiết tính toán — hiển thị debug / giải thích */
  breakdown: {
    reducedDay: NumerologyNumber;
    reducedMonth: NumerologyNumber;
    reducedYear: NumerologyNumber;
    lifePathSum: number;
    personalYearTarget: number;
  };
}

/** Parse chuỗi ngày ISO (YYYY-MM-DD) */
export function parseBirthDate(isoDate: string): BirthDate {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) {
    throw new Error("Ngày sinh không hợp lệ");
  }
  return { day: d, month: m, year: y };
}

/**
 * Số Đường Đời — rút gọn riêng ngày/tháng/năm, cộng 3, rút gọn lần cuối.
 * VD: 23/05/2008 → 5+5+1=11
 */
export function calculateLifePath(birth: BirthDate): {
  lifePath: NumerologyNumber;
  reducedDay: NumerologyNumber;
  reducedMonth: NumerologyNumber;
  reducedYear: NumerologyNumber;
  sum: number;
} {
  const reducedDay = reduceComponent(birth.day);
  const reducedMonth = reduceComponent(birth.month);
  const reducedYear = reduceComponent(birth.year);
  const sum = reducedDay + reducedMonth + reducedYear;
  const lifePath = reduceNumber(sum);

  return { lifePath, reducedDay, reducedMonth, reducedYear, sum };
}

/** Số Ngày Sinh — rút gọn ngày trong tháng */
export function calculateBirthDay(birth: BirthDate): NumerologyNumber {
  return reduceComponent(birth.day);
}

/**
 * Năm Cá Nhân — rútgọn(rútgọn(ngày)+rútgọn(tháng)+rútgọn(năm_mục_tiêu))
 */
export function calculatePersonalYear(
  birth: BirthDate,
  targetYear: number
): NumerologyNumber {
  const reducedDay = reduceComponent(birth.day);
  const reducedMonth = reduceComponent(birth.month);
  const reducedTargetYear = reduceComponent(targetYear);
  return reduceNumber(reducedDay + reducedMonth + reducedTargetYear);
}

/** Tính đầy đủ từ ngày sinh ISO */
export function calculateNumerology(
  isoDate: string,
  personalYearTarget = 2026
): NumerologyResult {
  const birth = parseBirthDate(isoDate);
  const life = calculateLifePath(birth);
  const birthDay = calculateBirthDay(birth);
  const personalYear = calculatePersonalYear(birth, personalYearTarget);

  return {
    lifePath: life.lifePath,
    birthDay,
    personalYear,
    breakdown: {
      reducedDay: life.reducedDay,
      reducedMonth: life.reducedMonth,
      reducedYear: life.reducedYear,
      lifePathSum: life.sum,
      personalYearTarget,
    },
  };
}
