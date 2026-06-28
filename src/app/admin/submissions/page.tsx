import { redirect } from "next/navigation";
import { AdminSubmissionsPanel } from "@/components/admin/AdminSubmissionsPanel";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_EVENT_SLUG, SEED_EVENT_ID } from "@/lib/constants";

export const metadata = { title: "Admin — Kiểm duyệt & Chốt cây" };

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

  try {
    const admin = createAdminClient();
    const { data: event } = await admin
      .from("events")
      .select("id, slug, status")
      .eq("slug", DEFAULT_EVENT_SLUG)
      .single();
    if (event) {
      eventId = event.id;
      eventSlug = event.slug;
      eventStatus = event.status;
    }
  } catch {
    // Supabase chưa cấu hình — dùng seed defaults
  }

  return (
    <AdminSubmissionsPanel
      eventId={eventId}
      eventSlug={eventSlug}
      eventStatus={eventStatus}
    />
  );
}
