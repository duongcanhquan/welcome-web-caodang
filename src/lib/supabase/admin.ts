import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/config/env";

/** Supabase admin client — bypass RLS, chỉ dùng server-side */
export function createAdminClient() {
  const serviceRoleKey = serverEnv.supabaseServiceRoleKey;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình");
  }

  return createClient(publicEnv.supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
