import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env";

/** Supabase client cho Client Components (browser) */
export function createClient() {
  return createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey
  );
}
