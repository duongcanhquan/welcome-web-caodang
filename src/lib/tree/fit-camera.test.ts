import { describe, expect, it } from "vitest";
import { computeTreeCamera } from "./fit-camera";

const W = 900;
const H = 1100;

function assertFullyVisible(
  vw: number,
  vh: number,
  cam: ReturnType<typeof computeTreeCamera>
) {
  expect(cam.panY).toBeGreaterThanOrEqual(-1);
  expect(cam.panY + H * cam.scale).toBeLessThanOrEqual(vh + 1);
  expect(cam.panX).toBeGreaterThanOrEqual(-1);
  expect(cam.panX + W * cam.scale).toBeLessThanOrEqual(vw + 1);
}

describe("computeTreeCamera", () => {
  it("desktop landscape keeps the full canvas in view", () => {
    const cam = computeTreeCamera(1920, 1080, W, H);
    expect(cam.mode).toBe("contain");
    assertFullyVisible(1920, 1080, cam);
  });

  it("phone portrait keeps canopy sides in view (no width crop)", () => {
    const cam = computeTreeCamera(390, 844, W, H);
    expect(cam.mode).toBe("contain");
    assertFullyVisible(390, 844, cam);
    // Width-limited: tree should nearly span the phone width (with pad)
    expect(W * cam.scale).toBeGreaterThan(390 * 0.85);
    expect(W * cam.scale).toBeLessThanOrEqual(390 + 1);
  });

  it("wide projector keeps the full canvas in view", () => {
    const cam = computeTreeCamera(1600, 900, W, H);
    expect(cam.mode).toBe("contain");
    assertFullyVisible(1600, 900, cam);
  });
});
