import { describe, expect, it } from "vitest";
import { fromArrayBuffer } from "@smithy/util-buffer-from";
import { toOwnedBuffer } from "./owned";

describe("toOwnedBuffer", () => {
  it("copies SharedArrayBuffer into ArrayBuffer-backed Buffer (AWS SDK safe)", () => {
    const sab = new SharedArrayBuffer(4);
    new Uint8Array(sab).set([10, 20, 30, 40]);

    const owned = toOwnedBuffer(sab);

    expect(Buffer.isBuffer(owned)).toBe(true);
    expect(owned.buffer).toBeInstanceOf(ArrayBuffer);
    expect(owned.equals(Buffer.from([10, 20, 30, 40]))).toBe(true);

    // Smithy checksum path — must not throw
    expect(() =>
      fromArrayBuffer(owned.buffer, owned.byteOffset, owned.byteLength)
    ).not.toThrow();
  });

  it("copies SAB-backed Buffer.from(sab) which otherwise keeps SharedArrayBuffer", () => {
    const sab = new SharedArrayBuffer(3);
    new Uint8Array(sab).set([1, 2, 3]);
    const sharedView = Buffer.from(sab);
    expect(sharedView.buffer).toBeInstanceOf(SharedArrayBuffer);

    const owned = toOwnedBuffer(sharedView);
    expect(owned.buffer).toBeInstanceOf(ArrayBuffer);
    expect(() =>
      fromArrayBuffer(owned.buffer, owned.byteOffset, owned.byteLength)
    ).not.toThrow();
  });
});
