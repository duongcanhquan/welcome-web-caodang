import { HomePageClient } from "@/components/home/HomePageClient";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";
import { getActiveEvent } from "@/lib/events/active";

async function getHomeTreeState(): Promise<{
  treeReady: boolean;
  eventSlug: string;
}> {
  try {
    const active = await getActiveEvent();
    const slug = active?.slug ?? DEFAULT_EVENT_SLUG;
    return {
      treeReady: active?.status === "locked",
      eventSlug: slug,
    };
  } catch {
    return { treeReady: false, eventSlug: DEFAULT_EVENT_SLUG };
  }
}

/** Trang chủ welcome — hiển thị link cây khi admin đã chốt */
export default async function HomePage() {
  const { treeReady, eventSlug } = await getHomeTreeState();
  return <HomePageClient treeReady={treeReady} eventSlug={eventSlug} />;
}
