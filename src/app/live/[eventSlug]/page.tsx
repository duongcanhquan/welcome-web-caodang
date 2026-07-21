import { LiveTreeView } from "@/components/tree/LiveTreeView";
import { getLiveTreeLayout } from "@/lib/tree/get-layout";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";

export const metadata = { title: "Trình chiếu LIVE — Cây Khóa 2026" };

export default async function LivePage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ present?: string }>;
}) {
  const { eventSlug } = await params;
  const { present } = await searchParams;
  const slug = eventSlug || DEFAULT_EVENT_SLUG;
  const fullscreen = present === "1";

  let layout = null;
  let eventId = "";
  let blossomEvery = 50;
  let eventName = slug;
  let batchLabel = "";
  let classLabel = "";

  try {
    const result = await getLiveTreeLayout(slug);
    if (result) {
      layout = result.layout;
      eventId = result.event.eventId;
      blossomEvery = result.event.settings.blossomEvery;
      eventName = result.event.name;
      batchLabel = result.event.batchLabel;
      classLabel = result.event.classLabel;
    }
  } catch {
    // Supabase chưa cấu hình
  }

  if (!layout) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">Chưa có dữ liệu cây</p>
          <p className="mt-2 text-sm text-ink-muted">
            Cấu hình Supabase và chạy migration để xem cây trực tiếp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LiveTreeView
      eventSlug={slug}
      eventId={eventId}
      eventName={eventName}
      batchLabel={batchLabel}
      classLabel={classLabel}
      initialLayout={layout}
      blossomEvery={blossomEvery}
      fullscreen={fullscreen}
    />
  );
}
