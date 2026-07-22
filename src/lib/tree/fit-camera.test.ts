import { describe, expect, it } from "vitest";
import { computeTreeCamera } from "./fit-camera";

const W = 900;
const H = 1100;

describe("computeTreeCamera", () => {
  it("desktop landscape uses contain so the full canvas fits", () => {
    const cam = computeTreeCamera(1920, 1080, W, H);
    expect(cam.mode).toBe("contain");
    expect(cam.panY).toBeGreaterThanOrEqual(-1);
    expect(cam.panY + H * cam.scale).toBeLessThanOrEqual(1080 + 1);
    expect(cam.panX).toBeGreaterThanOrEqual(-1);
    expect(cam.panX + W * cam.scale).toBeLessThanOrEqual(1920 + 1);
  });

  it("phone portrait uses cover to fill the screen", () => {
    const cam = computeTreeCamera(390, 844, W, H);
    expect(cam.mode).toBe("cover");
    expect(W * cam.scale).toBeGreaterThanOrEqual(390 - 1);
    expect(H * cam.scale).toBeGreaterThanOrEqual(844 - 1);
  });

  it("does not force cover on wide desktop (presentation projectors)", () => {
    const cam = computeTreeCamera(1600, 900, W, H);
    expect(cam.mode).toBe("contain");
  });
});
