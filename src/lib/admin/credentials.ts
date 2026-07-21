/**
 * Tài khoản admin cố định cho sự kiện.
 * Username có thể gõ "duongcanhquan"; Auth vẫn dùng email nội bộ.
 */
export const HARDCODED_ADMIN = {
  username: "duongcanhquan",
  email: "duongcanhquan@vietmycollege.com",
  password: "123456",
} as const;

/** Chuẩn hoá input login → email Supabase Auth */
export function resolveAdminEmail(input: string): string {
  const raw = input.trim().toLowerCase();
  if (!raw) return raw;
  if (raw === HARDCODED_ADMIN.username || raw === HARDCODED_ADMIN.email) {
    return HARDCODED_ADMIN.email;
  }
  if (!raw.includes("@")) {
    return `${raw}@vietmycollege.com`;
  }
  return raw;
}
