import { describe, expect, it } from "vitest";
import {
  computeBaseLeafSize,
  leafHitRadiusMultiplier,
  minDistForCount,
} from "./leaf-size";

describe("computeBaseLeafSize", () => {
  it("keeps original-sized photos for normal trees", () => {
    expect(computeBaseLeafSize(40)).toBe(52);
    expect(computeBaseLeafSize(200)).toBe(52);
  });

  it("only gently shrinks when extremely crowded", () => {
    const crowded = computeBaseLeafSize(800);
    expect(crowded).toBeGreaterThanOrEqual(44);
    expect(crowded).toBeLessThanOrEqual(52);
  });

  it("mini stays small", () => {
    expect(computeBaseLeafSize(200, { mini: true })).toBe(28);
  });
});

describe("minDistForCount", () => {
  it("matches visual diameter so photos can touch but not overlap", () => {
    const size = computeBaseLeafSize(100);
    const d = minDistForCount(100);
    // ≈ diameter with 2% gap
      expect(d).toBeGreaterThan((size * 0.95) / 900);
    expect(d).toBeLessThan((size * 1.08) / 900);
  });
});

describe("leafHitRadiusMultiplier", () => {
  it("keeps a usable hit pad", () => {
    expect(leafHitRadiusMultiplier(52)).toBeGreaterThanOrEqual(1.4);
  });
});
