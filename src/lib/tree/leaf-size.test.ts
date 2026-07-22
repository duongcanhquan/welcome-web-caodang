import { describe, expect, it } from "vitest";
import { computeBaseLeafSize, leafHitRadiusMultiplier } from "./leaf-size";

describe("computeBaseLeafSize", () => {
  it("keeps larger photos when few leaves", () => {
    expect(computeBaseLeafSize(40)).toBeGreaterThanOrEqual(40);
  });

  it("shrinks when crowded", () => {
    const crowded = computeBaseLeafSize(400);
    expect(crowded).toBeLessThan(30);
    expect(crowded).toBeGreaterThanOrEqual(20);
  });

  it("mini stays small", () => {
    expect(computeBaseLeafSize(200, { mini: true })).toBe(22);
  });
});

describe("leafHitRadiusMultiplier", () => {
  it("widens hit area for small leaves", () => {
    expect(leafHitRadiusMultiplier(22)).toBeGreaterThan(
      leafHitRadiusMultiplier(44)
    );
  });
});
