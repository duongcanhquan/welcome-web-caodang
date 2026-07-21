import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSupabasePublicEnv, publicEnv } from "@/lib/config/env";

/**
 * Browser Supabase client.
 * Trả null nếu thiếu NEXT_PUBLIC_SUPABASE_URL / ANON_KEY — không throw
 * (tránh white-screen trên /me khi realtime không cấu hình).
 */
export function tryCreateClient(): SupabaseClient | null {
  if (!hasSupabasePublicEnv()) return null;
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}

/** Dùng khi bắt buộc có client (vd. admin logout). */
export function createClient(): SupabaseClient {
  const client = tryCreateClient();
  if (!client) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY. Thêm trên Vercel → Redeploy."
    );
  }
  return client;
}
