import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { publicEnv } from "@/lib/config/env";

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Email hoặc mật khẩu không đúng.",
  "Email not confirmed": "Email chưa được xác nhận — liên hệ quản trị.",
};

export async function POST(request: Request) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return NextResponse.json(
      { error: "Thiếu cấu hình Supabase trên server." },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Vui lòng nhập email và mật khẩu." },
      { status: 400 }
    );
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
