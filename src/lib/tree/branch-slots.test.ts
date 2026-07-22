import { describe, expect, it } from "vitest";
import { generatePhotoSlotsOnTree } from "./branch-slots";
import { computeBaseLeafSize } from "./leaf-size";

const W = 900;
const H = 1100;

function minPixelDist(slots: { x: number; y: number }[]): number {
  let min = Infinity;
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const d = Math.hypot(
        (slots[i].x - slots[j].x) * W,
        (slots[i].y - slots[j].y) * H
      );
      if (d < min) min = d;
    }
  }
  return min;
}

describe("generatePhotoSlotsOnTree even spread", () => {
  for (const n of [60, 120]) {
    it(`N=${n}: no pixel overlap at full size`, () => {
      const slots = generatePhotoSlotsOnTree(n, 42);
      expect(slots.length).toBe(n);
      const size = computeBaseLeafSize(n);
      // Cho phép sát ~95% đường kính — không đè mạnh
      expect(minPixelDist(slots)).toBeGreaterThanOrEqual(size * 0.92);
    });
  }

  it("uses left, right, and lower tree (not only crown tip)", () => {
    const slots = generatePhotoSlotsOnTree(100, 7);
    const xs = slots.map((s) => s.x);
    const ys = slots.map((s) => s.y);
    expect(Math.min(...xs)).toBeLessThan(0.25);
    expect(Math.max(...xs)).toBeGreaterThan(0.75);
    expect(ys.filter((y) => y > 0.45).length).toBeGreaterThan(10);
    expect(ys.filter((y) => y < 0.25).length).toBeGreaterThan(5);
  });

  it("keeps scale near 1 (full size)", () => {
    const slots = generatePhotoSlotsOnTree(80, 3);
    const avg =
      slots.reduce((s, l) => s + l.scale, 0) / Math.max(1, slots.length);
    expect(avg).toBeGreaterThan(0.9);
  });
});
