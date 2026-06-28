import { HomePageClient } from "@/components/home/HomePageClient";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

async function getTreeReady(): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("events")
      .select("status")
      .eq("slug", DEFAULT_EVENT_SLUG)
      .single();
    return data?.status === "locked";
  } catch {
    return false;
  }
}

/** Trang chủ welcome — hiển thị link cây khi admin đã chốt */
export default async function HomePage() {
  const treeReady = await getTreeReady();
  return <HomePageClient treeReady={treeReady} />;
}
