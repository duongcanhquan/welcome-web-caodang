import { redirect } from "next/navigation";
import { AdminSubmissionsPanel } from "@/components/admin/AdminSubmissionsPanel";
import { AdminEventOverview, type EventSettingsSnapshot } from "@/components/admin/AdminEventOverview";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_EVENT_SLUG, SEED_EVENT_ID } from "@/lib/constants";

export const metadata = { title: "Admin — Kiểm duyệt & Chốt cây" };

async function loadSnapshot(eventId: string, slug: string, status: string, name: string): Promise<EventSettingsSnapshot> {
  try {
    const admin = createAdminClient();
    const { data: settings } = await admin
      .from("event_settings")
      .select("*")
      .eq("event_id", eventId)
      .single();
    const { count } = await admin
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("hidden", false);
    return {
      slug,
      name,
      status,
      fillRatio: Number(settings?.fill_ratio ?? 0.9),
      leavesMin: settings?.leaves_min ?? 40,
      leavesMax: settings?.leaves_max ?? 1500,
      blossomEvery: settings?.blossom_every ?? 50,
      maxFileMb: Number(settings?.max_file_mb ?? 5),
      rateLimitPerIp: settings?.rate_limit_per_ip ?? 3,
      rootsText: settings?.roots_text ?? "",
      totalSubmissions: count ?? 0,
    };
  } catch {
    return {
      slug,
      name,
      status,
      fillRatio: 0.9,
      leavesMin: 40,
      leavesMax: 1500,
      blossomEvery: 50,
      maxFileMb: 5,
      rateLimitPerIp: 3,
      rootsText: "",
      totalSubmissions: 0,
    };
  }
}

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin");
  if (user.app_metadata?.role !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-coral">Tài khoản không có quyền admin.</p>
      </div>
    );
  }

  let eventId = SEED_EVENT_ID;
  let eventSlug = DEFAULT_EVENT_SLUG;
  let eventStatus = "collecting";
  let eventName = "Cây Khóa 2026";
  let snapshot: EventSettingsSnapshot | null = null;

  try {
    const admin = createAdminClient();
    const { data: event } = await admin
      .from("events")
      .select("id, slug, name, status")
      .eq("slug", DEFAULT_EVENT_SLUG)
      .single();
    if (event) {
      eventId = event.id;
      eventSlug = event.slug;
      eventStatus = event.status;
      eventName = event.name;
      snapshot = await loadSnapshot(event.id, event.slug, event.status, event.name);
    }
  } catch {
    // Supabase chưa cấu hình — dùng seed defaults
  }

  return (
    <div className="space-y-8">
      {snapshot && <div className="mx-auto max-w-4xl px-4 pt-8"><AdminEventOverview settings={snapshot} /></div>}
      <AdminSubmissionsPanel
      eventId={eventId}
      eventSlug={eventSlug}
      eventStatus={eventStatus}
    />
    </div>
  );
}
