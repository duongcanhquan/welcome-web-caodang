import { describe, expect, it } from "vitest";
import { extensionFromUrl } from "@/lib/events/export";

describe("extensionFromUrl", () => {
  it("detects webp", () => {
    expect(extensionFromUrl("https://cdn.example/submissions/a/leaf.webp")).toBe(
      "webp"
    );
  });

  it("detects png with query", () => {
    expect(extensionFromUrl("https://cdn.example/x.png?v=1")).toBe("png");
  });

  it("defaults to webp", () => {
    expect(extensionFromUrl("https://cdn.example/noext")).toBe("webp");
  });
});
