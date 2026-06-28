import type { Database } from "@/lib/types/database";

export type TypedSupabaseClient = ReturnType<
  typeof import("@supabase/supabase-js").createClient<Database>
>;

/** Event slug mặc định cho orientation Khóa 2026 */
export const DEFAULT_EVENT_SLUG = "k2026";

/** ID event seed (migration) — dùng khi cần tham chiếu cố định */
export const SEED_EVENT_ID = "a0000000-0000-4000-8000-000000000001";

/** Danh sách ngành — Cao đẳng Việt Mỹ Khóa 2026 */
export const EVENT_MAJORS = [
  "Quản trị doanh nghiệp",
  "Tiếng Anh",
  "Tiếng Hàn",
  "Tiếng Trung",
  "Tiếng Nhật",
  "Ứng Dụng Phần mềm",
  "Công nghệ ô tô",
  "Chăm sóc sắc đẹp",
  "Marketing",
  "Thiết kế đồ họa",
] as const;

/** @deprecated Dùng EVENT_MAJORS */
export const FALLBACK_MAJORS = [...EVENT_MAJORS];
