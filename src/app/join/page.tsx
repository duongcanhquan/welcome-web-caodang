import { JoinPageContent } from "@/components/join/JoinPageContent";
import { DEFAULT_EVENT_SLUG, FALLBACK_MAJORS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Gửi vào cây — Cây Khóa 2026",
};

async function getEventSettings(slug: string) {
  try {
    const admin = createAdminClient();
    const { data: event } = await admin
      .from("events")
      .select("id, slug, name, status")
      .eq("slug", slug)
      .single();

    if (!event) return null;

    const { data: settings } = await admin
      .from("event_settings")
      .select("majors, max_file_mb, policy_url")
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
  const slug = eventParam ?? DEFAULT_EVENT_SLUG;
  const data = await getEventSettings(slug);

  const majors = (data?.settings?.majors as string[] | undefined) ?? FALLBACK_MAJORS;
  const maxFileMb = Number(data?.settings?.max_file_mb) || 5;
  const policyUrl = data?.settings?.policy_url ?? "/privacy";
  const isLocked = data?.event?.status === "locked";

  return (
    <JoinPageContent
      majors={majors}
      eventSlug={slug}
      maxFileMb={maxFileMb}
      policyUrl={policyUrl}
      isLocked={isLocked}
    />
  );
}
