import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/config/env";
import {
  HARDCODED_ADMIN,
  resolveAdminEmail,
} from "@/lib/admin/credentials";

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Tài khoản hoặc mật khẩu không đúng.",
  "Email not confirmed": "Email chưa được xác nhận — liên hệ quản trị.",
};

/** Tạo / đặt lại admin cố định bằng service role */
async function ensureHardcodedAdmin(): Promise<void> {
  const admin = createAdminClient();
  const email = HARDCODED_ADMIN.email;
  const password = HARDCODED_ADMIN.password;

  let page = 1;
  let existing: { id: string; app_metadata?: Record<string, unknown> } | null =
    null;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) {
      existing = found;
      break;
    }
    if (data.users.length < 200) break;
    page += 1;
  }

  if (!existing) {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: {
        full_name: "Admin Việt Mỹ",
        username: HARDCODED_ADMIN.username,
      },
    });
    if (error) throw error;
    return;
  }

  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    app_metadata: { ...existing.app_metadata, role: "admin" },
  });
  if (error) throw error;
}

export async function POST(request: Request) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return NextResponse.json(
      { error: "Thiếu cấu hình Supabase trên server." },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string; username?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const email = resolveAdminEmail(body.email ?? body.username ?? "");
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Vui lòng nhập tài khoản và mật khẩu." },
      { status: 400 }
    );
  }

  const isHardcodedAttempt =
    email === HARDCODED_ADMIN.email && password === HARDCODED_ADMIN.password;

  // Tài khoản cố định: luôn đảm bảo user tồn tại + role admin trước khi đăng nhập
  if (isHardcodedAttempt) {
    try {
      await ensureHardcodedAdmin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không tạo được admin";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  const supabase = await createRouteHandlerClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return NextResponse.json(
      {
        error: AUTH_ERRORS[signInError.message] ?? signInError.message,
      },
      { status: 401 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Không đọc được phiên đăng nhập." },
      { status: 500 }
    );
  }

  if (user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return NextResponse.json(
      {
        error:
          "Tài khoản không có quyền admin. Chạy: npm run admin:setup",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, email: user.email });
}
