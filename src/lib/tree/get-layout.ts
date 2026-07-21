import { createAdminClient } from "@/lib/supabase/admin";
import { buildTreeLayout, type LayoutSettings } from "@/lib/tree";
import type { SubmissionForLayout, TreeLayout } from "@/lib/tree/types";

export interface EventTreeData {
  eventId: string;
  slug: string;
  name: string;
  status: "collecting" | "locked";
  batchLabel: string;
  classLabel: string;
  settings: LayoutSettings;
}

/** Lấy event + settings từ slug */
export async function getEventTreeData(
  slug: string
): Promise<EventTreeData | null> {
  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, slug, name, status, batch_label, class_label")
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
    batchLabel: event.batch_label ?? "",
    classLabel: event.class_label ?? "",
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
        leafUrl: sub?.leaf_url || sub?.photo_url || null,
        photoUrl: sub?.photo_url || sub?.leaf_url || null,
        name: sub?.name,
        major: sub?.major,
        wish: sub?.wish,
        token: sub?.token,
        fallen: (l.fallen as boolean) ?? false,
        blossom: (l.blossom as boolean) ?? false,
      };
    }
  );

  // Mosaic slim (chỉ lá thật) → bổ sung filler từ buildTreeLayout, giữ toạ độ đã chốt
  const realCount = leaves.filter((l) => !l.filler && l.submissionId).length;
  const resolution = Number(mosaic.resolution) || realCount;
  if (realCount > 0 && realCount < resolution) {
    const live = buildTreeLayout(
      (submissions ?? []) as SubmissionForLayout[],
      event.settings,
      hashEventId(event.eventId)
    );
    const byId = new Map(
      leaves.filter((l) => l.submissionId).map((l) => [l.submissionId!, l])
    );
    for (const leaf of live.leaves) {
      if (leaf.filler) {
        leaves.push(leaf);
        continue;
      }
      const locked = leaf.submissionId
        ? byId.get(leaf.submissionId)
        : undefined;
      if (locked) {
        leaf.x = locked.x;
        leaf.y = locked.y;
        leaf.rotation = locked.rotation;
        leaf.scale = locked.scale;
        leaf.fallen = locked.fallen;
        leaf.blossom = locked.blossom;
      }
    }
    return {
      layout: {
        ...live,
        leaves: live.leaves,
        totalSubmissions: realCount,
      },
      event,
      mosaicVersion: mosaic.version,
    };
  }

  const layout: TreeLayout = {
    shape: mosaic.shape,
    resolution,
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
    totalSubmissions: realCount,
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
