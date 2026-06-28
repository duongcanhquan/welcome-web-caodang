import { ViewerTreeView } from "@/components/tree/ViewerTreeView";
import { getTreeLayoutForEvent } from "@/lib/tree/get-layout";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";

export const metadata = { title: "Xem điều kỳ diệu — Cây Khóa 2026" };

export default async function ViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ present?: string; highlight?: string }>;
}) {
  const { eventSlug } = await params;
  const { present, highlight } = await searchParams;
  const slug = eventSlug || DEFAULT_EVENT_SLUG;
  const presentation = present === "1";
  const highlightId = highlight ?? null;

  let layout = null;
  let dobMap: Record<string, string> = {};

  try {
    const result = await getTreeLayoutForEvent(slug);
    if (result) {
      layout = result.layout;

      const admin = createAdminClient();
      const { data: subs } = await admin
        .from("submissions")
        .select("id, dob")
        .eq("event_id", result.event.eventId);

      dobMap = Object.fromEntries(
        (subs ?? []).map((s) => [s.id, s.dob as string])
      );
    }
  } catch {
    // chưa cấu hình
  }

  if (!layout) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">Chưa có cây để xem</p>
          <p className="mt-2 text-sm text-ink-muted">
            Cấu hình Supabase hoặc chờ admin chốt cây.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ViewerTreeView
      eventSlug={slug}
      layout={layout}
      presentation={presentation}
      highlightId={highlightId}
      dobMap={dobMap}
    />
  );
}
