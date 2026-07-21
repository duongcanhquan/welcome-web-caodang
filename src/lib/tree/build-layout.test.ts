import { describe, expect, it } from "vitest";
import { buildTreeLayout } from "./build-layout";
import type { LayoutSettings, SubmissionForLayout } from "./types";

const baseSettings: LayoutSettings = {
  shape: "tree",
  fillRatio: 0.9,
  leavesMin: 40,
  leavesMax: 1500,
  blossomEvery: 50,
  fillerAssets: [],
  trunkConfig: { brandColor: "#3DBE8B" },
  rootsText: "Khóa 2026",
  majorColors: { "Công nghệ thông tin": "#3DBE8B", Khác: "#B8A9C9" },
};

function makeSubs(n: number): SubmissionForLayout[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `sub-${i}`,
    token: `tok-${i}`,
    name: `SV ${i}`,
    major: i % 2 === 0 ? "Công nghệ thông tin" : "Khác",
    wish: "Ước mơ",
    leaf_url: `/leaf-${i}.webp`,
    photo_url: `/photo-${i}.webp`,
    slot_index: i,
    hidden: false,
  }));
}

describe("buildTreeLayout co giãn", () => {
  for (const n of [10, 50, 200, 600]) {
    it(`N=${n}: có lá thật + filler hoặc fallen phù hợp`, () => {
      const layout = buildTreeLayout(makeSubs(n), baseSettings);
      const real = layout.leaves.filter((l) => !l.filler);
      const fillers = layout.leaves.filter((l) => l.filler);
      const fallen = layout.leaves.filter((l) => l.fallen);

      expect(real.length).toBe(n);
      expect(layout.resolution).toBeGreaterThanOrEqual(baseSettings.leavesMin);
      expect(layout.resolution).toBeLessThanOrEqual(baseSettings.leavesMax);

      if (n < layout.resolution * baseSettings.fillRatio) {
        expect(fillers.length).toBeGreaterThan(0);
      }

      if (n > layout.resolution) {
        expect(fallen.length).toBeGreaterThan(0);
      }
    });
  }

  it("N=2000: lá rụng khi vượt leavesMax", () => {
    const layout = buildTreeLayout(makeSubs(2000), baseSettings);
    const fallen = layout.leaves.filter((l) => l.fallen);
    expect(fallen.length).toBeGreaterThan(0);
  });

  it("slot_index lệch / lớn vẫn hiện đủ ảnh trên tán (không biến mất)", () => {
    const weird = makeSubs(5).map((s, i) => ({
      ...s,
      slot_index: 900 + i * 10,
    }));
    const layout = buildTreeLayout(weird, baseSettings);
    const realOnCanopy = layout.leaves.filter((l) => !l.filler && !l.fallen);
    expect(realOnCanopy).toHaveLength(5);
    expect(realOnCanopy.every((l) => l.leafUrl)).toBe(true);
  });
});
