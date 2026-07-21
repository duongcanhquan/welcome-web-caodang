/**
 * Thiết lập / đặt lại tài khoản admin Supabase Auth + kiểm tra đăng nhập.
 *
 * Chạy:
 *   node scripts/setup-admin.mjs
 *   node scripts/setup-admin.mjs duongcanhquan@vietmycollege.com
 *
 * Biến môi trường (từ .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

/** Tài khoản admin cố định */
const DEFAULT_EMAIL = "duongcanhquan@vietmycollege.com";
const DEFAULT_PASSWORD = "123456";

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
    console.warn("⚠ Không đọc được .env.local — dùng biến môi trường hiện có");
  }
}

function mask(value) {
  if (!value || value.length < 8) return "(thiếu)";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetEmail = (process.argv[2] || process.env.ADMIN_EMAIL || DEFAULT_EMAIL).toLowerCase();
const password = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

console.log("─── Setup Admin ───");
console.log("Supabase URL:", url || "(thiếu)");
console.log("Anon key:", mask(anonKey));
console.log("Service key:", mask(serviceKey));
console.log("Email:", targetEmail);
console.log("");

if (!url || !serviceKey) {
  console.error("❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!anonKey) {
  console.error("❌ Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY — cần để kiểm tra đăng nhập");
  process.exit(1);
}

const adminClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Tìm user theo email (paginate nếu cần) */
async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function upsertAdmin() {
  let user = await findUserByEmail(targetEmail);

  if (!user) {
    console.log(`→ Chưa có user — đang tạo ${targetEmail}...`);
    const { data, error } = await adminClient.auth.admin.createUser({
      email: targetEmail,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: { full_name: "Admin Việt Mỹ", username: "duongcanhquan" },
    });
    if (error) throw new Error(`Tạo user: ${error.message}`);
    user = data.user;
    console.log("✓ Đã tạo user mới, id:", user.id);
  } else {
    console.log(`→ User đã tồn tại (${user.id}) — cập nhật mật khẩu + role...`);
    const { error } = await adminClient.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      app_metadata: { ...user.app_metadata, role: "admin" },
      user_metadata: { ...user.user_metadata, username: "duongcanhquan" },
    });
    if (error) throw new Error(`Cập nhật user: ${error.message}`);
    console.log("✓ Đã cập nhật mật khẩu và role admin");
  }

  const { data: refreshed, error: getErr } = await adminClient.auth.admin.getUserById(user.id);
  if (getErr) throw new Error(`Đọc user: ${getErr.message}`);

  const role = refreshed.user.app_metadata?.role;
  if (role !== "admin") {
    throw new Error(`app_metadata.role = "${role}" — mong đợi "admin"`);
  }
  console.log("✓ app_metadata.role = admin");

  return refreshed.user;
}

async function verifyLogin() {
  console.log("\n─── Kiểm tra đăng nhập (anon key) ───");
  const publicClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await publicClient.auth.signInWithPassword({
    email: targetEmail,
    password,
  });

  if (error) {
    throw new Error(`Đăng nhập thất bại: ${error.message}`);
  }

  const role = data.user?.app_metadata?.role;
  console.log("✓ signInWithPassword thành công");
  console.log("  User id:", data.user?.id);
  console.log("  Email:", data.user?.email);
  console.log("  Role:", role ?? "(không có trong session)");

  if (role !== "admin") {
    throw new Error('Session không có role "admin" — kiểm tra JWT / app_metadata');
  }

  await publicClient.auth.signOut();
  console.log("✓ Đăng xuất test OK");
}

try {
  await upsertAdmin();
  await verifyLogin();

  console.log("\n══════════════════════════════════════");
  console.log("✅ Admin sẵn sàng đăng nhập tại /admin");
  console.log("   Tài khoản: duongcanhquan");
  console.log("   (hoặc email:", targetEmail + ")");
  console.log("   Mật khẩu: 123456");
  console.log("══════════════════════════════════════\n");
} catch (err) {
  console.error("\n❌ Lỗi:", err instanceof Error ? err.message : err);
  process.exit(1);
}
