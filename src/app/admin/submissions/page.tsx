import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { EventSettingsSnapshot } from "@/components/admin/AdminEventOverview";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_EVENT_SLUG, SEED_EVENT_ID } from "@/lib/constants";
import { getActiveEvent, getEventBySlug } from "@/lib/events/active";

export const metadata = { title: "Admin — WELCOME NEW LYONS" };

async function loadSnapshot(
  eventId: string,
  slug: string,
  status: string,
  name: string
): Promise<EventSettingsSnapshot> {
  try {
    const admin = createAdminClient();
    const { data: settings } = await admin
      .from("event_settings")
      .select("*")
      .eq("event_id", eventId)
      .single();
    const { count: totalAll } = await admin
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    let aiEnabled = false;
    let hasApiKey = false;
    const { data: secrets } = await admin
      .from("event_secrets")
      .select("ai_enabled, deepseek_api_key")
      .eq("event_id", eventId)
      .maybeSingle();
    if (secrets) {
      aiEnabled = secrets.ai_enabled;
      hasApiKey = Boolean(secrets.deepseek_api_key);
    }

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
      totalSubmissions: totalAll ?? 0,
      aiEnabled,
      hasApiKey,
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

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string; tab?: string }>;
}) {
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

  const { event: eventParam } = await searchParams;

  let eventId = SEED_EVENT_ID;
  let eventSlug = DEFAULT_EVENT_SLUG;
  let eventStatus = "collecting";
  let snapshot: EventSettingsSnapshot | null = null;

  try {
    let selected = eventParam ? await getEventBySlug(eventParam) : null;
    if (!selected) {
      selected = await getActiveEvent();
    }

    if (selected) {
      eventId = selected.id;
      eventSlug = selected.slug;
      eventStatus = selected.status;
      snapshot = await loadSnapshot(
        selected.id,
        selected.slug,
        selected.status,
        selected.name
      );
    }
  } catch {
    // Supabase chưa cấu hình
  }

  return (
    <Suspense
      fallback={
        <p className="py-20 text-center text-ink-muted">Đang tải admin…</p>
      }
    >
      <AdminDashboard
        eventId={eventId}
        eventSlug={eventSlug}
        eventStatus={eventStatus}
        snapshot={snapshot}
      />
    </Suspense>
  );
}
