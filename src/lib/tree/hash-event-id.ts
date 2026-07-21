/** Seed ổn định cho layout — tránh 0 (PRNG kẹt) */
export function hashEventId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 42;
}
