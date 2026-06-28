import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea =
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path.startsWith("/api/admin/");

  const isLoginPage = path === "/admin" || path === "/admin/login";

  if (isAdminArea && !isLoginPage && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && user?.app_metadata?.role === "admin") {
    const dest = request.nextUrl.searchParams.get("next") || "/admin/submissions";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = dest.startsWith("/admin") ? dest : "/admin/submissions";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
