import { HomePageClient } from "@/components/home/HomePageClient";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";
import { getActiveEvent } from "@/lib/events/active";

async function getHomeTreeState(): Promise<{
  treeReady: boolean;
  eventSlug: string;
  eventName: string;
  batchLabel: string;
  classLabel: string;
}> {
  try {
    const active = await getActiveEvent();
    const slug = active?.slug ?? DEFAULT_EVENT_SLUG;
    return {
      treeReady: active?.status === "locked",
      eventSlug: slug,
      eventName: active?.name ?? slug,
      batchLabel: active?.batch_label ?? "",
      classLabel: active?.class_label ?? "",
    };
  } catch {
    return {
      treeReady: false,
      eventSlug: DEFAULT_EVENT_SLUG,
      eventName: DEFAULT_EVENT_SLUG,
      batchLabel: "",
      classLabel: "",
    };
  }
}

/** Trang chủ welcome — hiển thị link cây khi admin đã chốt */
export default async function HomePage() {
  const state = await getHomeTreeState();
  return <HomePageClient {...state} />;
}
