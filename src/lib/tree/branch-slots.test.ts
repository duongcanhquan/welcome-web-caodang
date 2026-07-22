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
    it(`N=${n}: slots keep adaptive min distance`, () => {
      const slots = generatePhotoSlotsOnTree(n, 42);
      expect(slots).toHaveLength(n);
      const floor = minDistForCount(n) * 0.84; // cho phép nới nhẹ khi vùng dày
      expect(minPairwiseDist(slots)).toBeGreaterThanOrEqual(floor);
    });
  }

  it("uses trunk band below old canopy (y > 0.48)", () => {
    const slots = generatePhotoSlotsOnTree(120, 7);
    const onTrunk = slots.filter((s) => s.y > 0.48);
    expect(onTrunk.length).toBeGreaterThan(8);
    expect(Math.max(...slots.map((s) => s.y))).toBeGreaterThan(0.55);
  });
});
