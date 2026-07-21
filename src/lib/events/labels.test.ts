import { describe, expect, it } from "vitest";
import { composeEventName, formatEventCohort } from "./labels";

describe("event labels", () => {
  it("composes name from batch + class", () => {
    expect(composeEventName("Orientation 21/07", "Marketing sáng")).toBe(
      "Orientation 21/07 — Marketing sáng"
    );
    expect(composeEventName("Orientation 21/07", "")).toBe("Orientation 21/07");
  });

  it("formats cohort for badges", () => {
    expect(
      formatEventCohort({
        name: "Cây A",
        slug: "cay-a",
        batch_label: "Đợt 1",
        class_label: "CNTT",
      })
    ).toBe("Đợt 1 · CNTT");
  });
});
