import { describe, expect, it } from "vitest";
import { generatePhotoSlotsOnTree, minDistForCount } from "./branch-slots";

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
  for (const n of [80, 150, 400]) {
    it(`N=${n}: returns all slots with breathing room`, () => {
      const slots = generatePhotoSlotsOnTree(n, 42);
      expect(slots).toHaveLength(n);
      const d = minPairwiseDist(slots);
      // Luôn có khe tối thiểu; N nhỏ thì khe lớn hơn
      expect(d).toBeGreaterThanOrEqual(0.02);
      if (n <= 80) {
        expect(d).toBeGreaterThanOrEqual(minDistForCount(n) * 0.75);
      }
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
    expect(onTrunk.length).toBeGreaterThan(8);
    expect(Math.max(...slots.map((s) => s.y))).toBeGreaterThan(0.55);
  });
});
