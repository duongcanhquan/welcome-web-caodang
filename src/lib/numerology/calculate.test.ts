import { describe, expect, it } from "vitest";
import {
  calculateNumerology,
  calculateLifePath,
  calculatePersonalYear,
} from "./calculate";
import { reduceNumber } from "./reduce";

describe("reduceNumber", () => {
  it("rút gọn số thường", () => {
    expect(reduceNumber(23)).toBe(5);
    expect(reduceNumber(2008)).toBe(1);
  });

  it("giữ số bậc thầy 11, 22, 33", () => {
    expect(reduceNumber(11)).toBe(11);
    expect(reduceNumber(22)).toBe(22);
    expect(reduceNumber(33)).toBe(33);
  });
});

describe("Life Path", () => {
  it("23/05/2008 → Life Path 11", () => {
    const result = calculateLifePath({ day: 23, month: 5, year: 2008 });
    expect(result.reducedDay).toBe(5);
    expect(result.reducedMonth).toBe(5);
    expect(result.reducedYear).toBe(1);
    expect(result.sum).toBe(11);
    expect(result.lifePath).toBe(11);
  });

  it("tính đầy đủ từ ISO date", () => {
    const r = calculateNumerology("2008-05-23");
    expect(r.lifePath).toBe(11);
    expect(r.birthDay).toBe(5);
  });
});

describe("Năm Cá Nhân 2026", () => {
  it("23/05/2008 → personal year", () => {
    const py = calculatePersonalYear(
      { day: 23, month: 5, year: 2008 },
      2026
    );
    // 5 + 5 + reduce(2026=1) = 11
    expect(py).toBe(11);
  });
});
