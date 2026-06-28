import { redirect } from "next/navigation";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";
import type { EventSettingsSnapshot } from "@/components/admin/AdminEventOverview";

export const metadata = { title: "Admin — Cài đặt" };

async function loadEventSnapshot(): Promise<EventSettingsSnapshot | null> {
  try {
    const admin = createAdminClient();
    const { data: event } = await admin
      .from("events")
      .select("id, slug, name, status")
      .eq("slug", DEFAULT_EVENT_SLUG)
      .single();
    if (!event) return null;

    const { data: settings } = await admin
      .from("event_settings")
      .select("*")
      .eq("event_id", event.id)
      .single();

    const { count } = await admin
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("hidden", false);

    let aiEnabled = false;
    let hasApiKey = false;
    const { data: secrets } = await admin
      .from("event_secrets")
      .select("ai_enabled, deepseek_api_key")
      .eq("event_id", event.id)
      .maybeSingle();
    if (secrets) {
      aiEnabled = secrets.ai_enabled;
      hasApiKey = Boolean(secrets.deepseek_api_key);
    }

    return {
      slug: event.slug,
      name: event.name,
      status: event.status,
      fillRatio: Number(settings?.fill_ratio ?? 0.9),
      leavesMin: settings?.leaves_min ?? 40,
      leavesMax: settings?.leaves_max ?? 1500,
      blossomEvery: settings?.blossom_every ?? 50,
      maxFileMb: Number(settings?.max_file_mb ?? 5),
      rateLimitPerIp: settings?.rate_limit_per_ip ?? 3,
      rootsText: settings?.roots_text ?? "",
      totalSubmissions: count ?? 0,
      aiEnabled,
      hasApiKey,
    };
  } catch {
    return null;
  }
}

export default async function AdminSettingsPage() {
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

  const snapshot = await loadEventSnapshot();

  return <AdminSettingsClient eventSnapshot={snapshot} />;
}
