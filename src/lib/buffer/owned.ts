/**
 * Copy binary data into a Node Buffer backed by a real ArrayBuffer.
 *
 * On Node/Vercel, Blob/File.arrayBuffer() can resolve to SharedArrayBuffer.
 * Buffer.from(SharedArrayBuffer) shares that memory — AWS SDK (Smithy)
 * then throws: The "input" argument must be ArrayBuffer. Received …
 * SharedArrayBuffer when computing PutObject checksums for R2.
 */
export function toOwnedBuffer(
  source: ArrayBuffer | SharedArrayBuffer | ArrayBufferView
): Buffer {
  const view =
    ArrayBuffer.isView(source)
      ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
      : new Uint8Array(source);
  // Buffer.from(TypedArray) copies bytes → ArrayBuffer-backed Buffer
  return Buffer.from(view);
}

export async function fileToOwnedBuffer(file: Blob): Promise<Buffer> {
  return toOwnedBuffer(await file.arrayBuffer());
}
