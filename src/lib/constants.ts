import type { Database } from "@/lib/types/database";

export type TypedSupabaseClient = ReturnType<
  typeof import("@supabase/supabase-js").createClient<Database>
>;

/** Event slug mặc định cho orientation Khóa 2026 */
export const DEFAULT_EVENT_SLUG = "k2026";

/** ID event seed (migration) — dùng khi cần tham chiếu cố định */
export const SEED_EVENT_ID = "a0000000-0000-4000-8000-000000000001";

/** Fallback khi chưa kết nối Supabase */
export const FALLBACK_MAJORS = [
  "Công nghệ thông tin",
  "Thiết kế đồ họa",
  "Marketing",
  "Du lịch",
  "Ngôn ngữ Anh",
  "Kế toán",
  "Điều dưỡng",
  "Khác",
];
