/**
 * Đặt lại mật khẩu admin trên Supabase Auth.
 * Chạy: node scripts/reset-admin-password.mjs [email]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const PASSWORD = "canhquan1221";
const DEFAULT_EMAIL = "admin@vietmycollege.com";

function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.warn("Không đọc được .env.local — dùng biến môi trường hiện có");
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetEmail = (process.argv[2] || process.env.ADMIN_EMAIL || DEFAULT_EMAIL).toLowerCase();

if (!url || !serviceKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
  perPage: 100,
});

if (listError) {
  console.error("Lỗi list users:", listError.message);
  process.exit(1);
}

let user = listData.users.find((u) => u.email?.toLowerCase() === targetEmail);

if (!user) {
  console.log(`Chưa có user ${targetEmail} — đang tạo mới...`);
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: targetEmail,
    password: PASSWORD,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (createError) {
    console.error("Lỗi tạo user:", createError.message);
    process.exit(1);
  }
  user = created.user;
  console.log("✓ Đã tạo admin:", targetEmail);
} else {
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: PASSWORD,
    app_metadata: { ...user.app_metadata, role: "admin" },
  });
  if (updateError) {
    console.error("Lỗi cập nhật:", updateError.message);
    process.exit(1);
  }
  console.log("✓ Đã đặt lại mật khẩu + role admin:", targetEmail);
}

console.log("\nĐăng nhập tại: /admin");
console.log("Email:", targetEmail);
console.log("(Mật khẩu đã cập nhật — không in ra console vì lý do bảo mật)");
