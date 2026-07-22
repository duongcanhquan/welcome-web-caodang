import { describe, expect, it } from "vitest";
import { generatePhotoSlotsOnTree, minDistForCount } from "./branch-slots";
import { computeBaseLeafSize } from "./leaf-size";

function minPairwiseDist(slots: { x: number; y: number }[]): number {
  let min = Infinity;
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const d = Math.hypot(slots[i].x - slots[j].x, slots[i].y - slots[j].y);
      if (d < min) min = d;
    }
  }
  return min;
}

describe("generatePhotoSlotsOnTree spacing", () => {
  for (const n of [80, 150]) {
    it(`N=${n}: no center closer than ~visual diameter`, () => {
      const slots = generatePhotoSlotsOnTree(n, 42);
      expect(slots.length).toBeGreaterThan(0);
      expect(slots.length).toBeLessThanOrEqual(n);
      const d = minPairwiseDist(slots);
      // Cho phép nới nhẹ so với preferred; không đè (scale gắn với dist)
      expect(d).toBeGreaterThanOrEqual(minDistForCount(n) * 0.7);
    });
  }

  it("spreads across a wide canopy (left and right edges)", () => {
    const slots = generatePhotoSlotsOnTree(120, 7);
    const xs = slots.map((s) => s.x);
    expect(Math.min(...xs)).toBeLessThan(0.2);
    expect(Math.max(...xs)).toBeGreaterThan(0.8);
  });

  it("uses trunk band below canopy (y > 0.48)", () => {
    const slots = generatePhotoSlotsOnTree(120, 7);
    const onTrunk = slots.filter((s) => s.y > 0.48);
    expect(onTrunk.length).toBeGreaterThan(5);
  });
});

describe("leaf size restored", () => {
  it("stays near original 52px for typical crowds", () => {
    expect(computeBaseLeafSize(80)).toBe(52);
    expect(computeBaseLeafSize(200)).toBe(52);
  });
});
