import { JoinPageContent } from "@/components/join/JoinPageContent";
import { DEFAULT_EVENT_SLUG, EVENT_MAJORS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveEvent } from "@/lib/events/active";

export const metadata = {
  title: "Gửi ảnh — Nhận Bất ngờ & Xem thần số học — WELCOME NEW LYONS",
};

async function getEventSettings(slug: string) {
  try {
    const admin = createAdminClient();
    const { data: event } = await admin
      .from("events")
      .select("id, slug, name, status, batch_label, class_label")
      .eq("slug", slug)
      .single();

    if (!event) return null;

    const { data: settings } = await admin
      .from("event_settings")
      .select("max_file_mb")
      .eq("event_id", event.id)
      .single();

    return { event, settings };
  } catch {
    return null;
  }
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: eventParam } = await searchParams;
  const active = eventParam ? null : await getActiveEvent();
  const slug = eventParam ?? active?.slug ?? DEFAULT_EVENT_SLUG;
  const data = await getEventSettings(slug);

  const majors = [...EVENT_MAJORS];
  const maxFileMb = Number(data?.settings?.max_file_mb) || 5;
  const isLocked = data?.event?.status === "locked";
  const eventName = data?.event?.name ?? slug;

  return (
    <JoinPageContent
      majors={majors}
      eventSlug={slug}
      eventName={eventName}
      batchLabel={data?.event?.batch_label ?? active?.batch_label ?? ""}
      classLabel={data?.event?.class_label ?? active?.class_label ?? ""}
      maxFileMb={maxFileMb}
      isLocked={isLocked}
    />
  );
}
