import { createAdminClient } from "@/lib/supabase/admin";
import { buildTreeLayout, type LayoutSettings } from "@/lib/tree";
import type { SubmissionForLayout, TreeLayout } from "@/lib/tree/types";

export interface EventTreeData {
  eventId: string;
  slug: string;
  name: string;
  status: "collecting" | "locked";
  settings: LayoutSettings;
}

/** Lấy event + settings từ slug */
export async function getEventTreeData(
  slug: string
): Promise<EventTreeData | null> {
  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, slug, name, status")
    .eq("slug", slug)
    .single();

  if (!event) return null;

  const { data: settings } = await admin
    .from("event_settings")
    .select("*")
    .eq("event_id", event.id)
    .single();

  if (!settings) return null;

  return {
    eventId: event.id,
    slug: event.slug,
    name: event.name,
    status: event.status as "collecting" | "locked",
    settings: {
      shape: settings.shape,
      fillRatio: Number(settings.fill_ratio),
      leavesMin: settings.leaves_min,
      leavesMax: settings.leaves_max,
      blossomEvery: settings.blossom_every,
      fillerAssets: (settings.filler_assets as string[]) ?? [],
      trunkConfig: (settings.trunk_config as LayoutSettings["trunkConfig"]) ?? {},
      rootsText: settings.roots_text ?? "",
      majorColors: (settings.major_colors as Record<string, string>) ?? {},
    },
  };
}

/** Layout live — tính từ submissions */
export async function getLiveTreeLayout(slug: string): Promise<{
  layout: TreeLayout;
  event: EventTreeData;
} | null> {
  const event = await getEventTreeData(slug);
  if (!event) return null;

  const admin = createAdminClient();
  const { data: submissions } = await admin
    .from("submissions")
    .select(
      "id, token, name, major, wish, leaf_url, photo_url, slot_index, hidden"
    )
    .eq("event_id", event.eventId)
    .order("slot_index", { ascending: true });

  const layout = buildTreeLayout(
    (submissions ?? []) as SubmissionForLayout[],
    event.settings,
    hashEventId(event.eventId)
  );

  return { layout, event };
}

/** Layout đã chốt — đọc từ mosaics */
export async function getLockedTreeLayout(slug: string): Promise<{
  layout: TreeLayout;
  event: EventTreeData;
  mosaicVersion: number;
} | null> {
  const event = await getEventTreeData(slug);
  if (!event) return null;

  const admin = createAdminClient();
  const { data: mosaic } = await admin
    .from("mosaics")
    .select("*")
    .eq("event_id", event.eventId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!mosaic) {
    return getLiveTreeLayout(slug) as Promise<{
      layout: TreeLayout;
      event: EventTreeData;
      mosaicVersion: number;
    } | null>;
  }

  const admin2 = createAdminClient();
  const { data: submissions } = await admin2
    .from("submissions")
    .select(
      "id, token, name, major, wish, leaf_url, photo_url, slot_index, hidden"
    )
    .eq("event_id", event.eventId);

  const subMap = new Map(
    (submissions ?? []).map((s) => [s.id, s as SubmissionForLayout])
  );

  const leaves = (mosaic.leaves as Array<Record<string, unknown>>).map(
    (l, i) => {
      const subId = l.submission_id as string | undefined;
      const sub = subId ? subMap.get(subId) : undefined;
      return {
        id: subId ?? `filler-${i}`,
        submissionId: subId,
        filler: (l.filler as boolean) ?? false,
        slotIndex: i,
        x: Number(l.x),
        y: Number(l.y),
        rotation: Number(l.rotation),
        scale: Number(l.scale),
        majorColor: (l.major_color as string) ?? "#3DBE8B",
        leafUrl: sub?.leaf_url,
        photoUrl: sub?.photo_url,
        name: sub?.name,
        major: sub?.major,
        wish: sub?.wish,
        token: sub?.token,
        fallen: (l.fallen as boolean) ?? false,
        blossom: (l.blossom as boolean) ?? false,
      };
    }
  );

  const layout: TreeLayout = {
    shape: mosaic.shape,
    resolution: mosaic.resolution,
    dimensions: { width: 900, height: 1100 },
    canopy: { x: 0.08, y: 0.04, w: 0.84, h: 0.52 },
    trunk: {
      x: 0.42,
      y: 0.52,
      w: 0.16,
      h: 0.28,
      color:
        (event.settings.trunkConfig.brandColor as string) ?? "#3DBE8B",
    },
    roots: {
      text: event.settings.rootsText,
      y: 0.88,
    },
    leaves,
    totalSubmissions: leaves.filter((l) => !l.filler).length,
    blossomMilestone: null,
  };

  return { layout, event, mosaicVersion: mosaic.version };
}

/** Layout phù hợp trạng thái event */
export async function getTreeLayoutForEvent(slug: string) {
  const event = await getEventTreeData(slug);
  if (!event) return null;

  if (event.status === "locked") {
    return getLockedTreeLayout(slug);
  }
  return getLiveTreeLayout(slug);
}

function hashEventId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
