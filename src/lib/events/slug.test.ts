import { describe, expect, it } from "vitest";
import { isValidSlug, normalizeSlug } from "@/lib/events/slug";

describe("normalizeSlug", () => {
  it("normalizes spaces and case", () => {
    expect(normalizeSlug("Khoa 2027")).toBe("khoa-2027");
  });

  it("strips invalid characters", () => {
    expect(normalizeSlug("k2027!!!")).toBe("k2027");
  });
});

describe("isValidSlug", () => {
  it("accepts simple slugs", () => {
    expect(isValidSlug("k2027")).toBe(true);
  });

  it("rejects empty", () => {
    expect(isValidSlug("")).toBe(false);
  });
});
