import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";
import type { Event } from "@/lib/types/database";

export type ActiveEvent = Pick<Event, "id" | "slug" | "name" | "status" | "is_active" | "created_at">;

/** Event đang chạy (join/home mặc định). Fallback slug k2026. */
export async function getActiveEvent(): Promise<ActiveEvent | null> {
  try {
    const admin = createAdminClient();
    const { data: active } = await admin
      .from("events")
      .select("id, slug, name, status, is_active, created_at")
      .eq("is_active", true)
      .maybeSingle();

    if (active) return active as ActiveEvent;

    const { data: fallback } = await admin
      .from("events")
      .select("id, slug, name, status, is_active, created_at")
      .eq("slug", DEFAULT_EVENT_SLUG)
      .maybeSingle();

    return (fallback as ActiveEvent | null) ?? null;
  } catch {
    return null;
  }
}

export async function getEventBySlug(slug: string): Promise<ActiveEvent | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("events")
      .select("id, slug, name, status, is_active, created_at")
      .eq("slug", slug)
      .maybeSingle();
    return (data as ActiveEvent | null) ?? null;
  } catch {
    return null;
  }
}
