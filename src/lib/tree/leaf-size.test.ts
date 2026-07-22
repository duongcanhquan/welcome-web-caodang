import { describe, expect, it } from "vitest";
import { computeBaseLeafSize, leafHitRadiusMultiplier } from "./leaf-size";

describe("computeBaseLeafSize", () => {
  it("keeps large photos when few leaves", () => {
    expect(computeBaseLeafSize(40)).toBe(52);
  });

  it("shrinks when crowded", () => {
    const crowded = computeBaseLeafSize(400);
    expect(crowded).toBeLessThan(45);
    expect(crowded).toBeGreaterThanOrEqual(28);
  });

  it("mini stays small", () => {
    expect(computeBaseLeafSize(200, { mini: true })).toBe(28);
  });
});

describe("leafHitRadiusMultiplier", () => {
  it("widens hit area for small leaves", () => {
    expect(leafHitRadiusMultiplier(28)).toBeGreaterThan(
      leafHitRadiusMultiplier(52)
    );
  });
});
