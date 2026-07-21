/**
 * Cấu hình biến môi trường — đọc từ .env.local / Vercel.
 * Ngưỡng sự kiện (fillRatio, leavesMin, …) nằm trong bảng event_settings.
 *
 * Lưu ý Next.js: NEXT_PUBLIC_* được inline lúc build vào bundle trình duyệt.
 * Sau khi thêm/sửa trên Vercel phải Redeploy để client nhận được.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

/**
 * Đọc biến public tại thời điểm gọi.
 * Trên client, Next đã thay process.env.NEXT_PUBLIC_* bằng chuỗi lúc build.
 */
function readPublic(name: string, fallback = ""): string {
  const value = process.env[name];
  return (value && value.trim()) || fallback;
}

/** Biến public — dùng được ở client */
export const publicEnv = {
  get supabaseUrl() {
    return readPublic("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return readPublic("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get r2PublicUrl() {
    return readPublic("NEXT_PUBLIC_R2_PUBLIC_URL");
  },
  get appUrl() {
    return readPublic("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  },
} as const;

/** Biến server-only — chỉ dùng trong API routes / Server Components */
export const serverEnv = {
  supabaseServiceRoleKey: optional("SUPABASE_SERVICE_ROLE_KEY"),
  r2: {
    accountId: optional("R2_ACCOUNT_ID"),
    accessKeyId: optional("R2_ACCESS_KEY_ID"),
    secretAccessKey: optional("R2_SECRET_ACCESS_KEY"),
    bucketName: optional("R2_BUCKET_NAME", "cay-khoa-2026"),
    endpoint: () => {
      const accountId = optional("R2_ACCOUNT_ID");
      return accountId
        ? `https://${accountId}.r2.cloudflarestorage.com`
        : "";
    },
  },
} as const;

/** Kiểm tra đủ biến cho môi trường production */
export function assertServerEnv(): void {
  required("NEXT_PUBLIC_SUPABASE_URL");
  required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  required("SUPABASE_SERVICE_ROLE_KEY");
  required("R2_ACCOUNT_ID");
  required("R2_ACCESS_KEY_ID");
  required("R2_SECRET_ACCESS_KEY");
  required("R2_BUCKET_NAME");
  required("NEXT_PUBLIC_R2_PUBLIC_URL");
}

/** Kiểm tra biến Supabase public (client) */
export function hasSupabasePublicEnv(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

/** Kiểm tra biến R2 server */
export function hasR2Env(): boolean {
  const { r2 } = serverEnv;
  return Boolean(
    r2.accountId && r2.accessKeyId && r2.secretAccessKey && r2.bucketName
  );
}
