import { createAdminClient } from "@/lib/supabase/admin";
import { buildTreeLayout, type LayoutSettings } from "@/lib/tree";
import { hashEventId } from "@/lib/tree/hash-event-id";
import { generatePhotoSlotsOnTree } from "@/lib/tree/branch-slots";
import type {
  SubmissionForLayout,
  TreeLayout,
  TreeLeaf,
} from "@/lib/tree/types";

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

function readMosaicLeaf(
  l: Record<string, unknown>,
  i: number,
  subMap: Map<string, SubmissionForLayout>
): TreeLeaf {
  const subId =
    (l.submission_id as string | undefined) ??
    (l.submissionId as string | undefined);
  const sub = subId ? subMap.get(subId) : undefined;
  const filler = (l.filler as boolean) ?? !subId;
  return {
    id: subId ?? `filler-${i}`,
    submissionId: subId,
    filler,
    slotIndex: i,
    x: Number(l.x),
    y: Number(l.y),
    rotation: Number(l.rotation),
    scale: Number(l.scale),
    majorColor:
      (l.major_color as string | undefined) ??
      (l.majorColor as string | undefined) ??
      "#3DBE8B",
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

/** Layout đã chốt — đọc từ mosaics; bổ sung filler nếu mosaic slim */
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
    const live = await getLiveTreeLayout(slug);
    if (!live) return null;
    return { ...live, mosaicVersion: 0 };
  }

  const { data: submissions } = await admin
    .from("submissions")
    .select(
      "id, token, name, major, wish, leaf_url, photo_url, slot_index, hidden"
    )
    .eq("event_id", event.eventId);

  const subMap = new Map(
    (submissions ?? []).map((s) => [s.id, s as SubmissionForLayout])
  );

  const mosaicRows = (mosaic.leaves as Array<Record<string, unknown>>) ?? [];
  const realLeavesRaw = mosaicRows
    .map((l, i) => readMosaicLeaf(l, i, subMap))
    .filter((l) => !l.filler && l.submissionId)
    .sort((a, b) => a.slotIndex - b.slotIndex);

  const resolution = Number(mosaic.resolution) || Math.max(realLeavesRaw.length, 40);
  const brandColor =
    (event.settings.trunkConfig.brandColor as string) ?? "#3DBE8B";

  // Rải lại vị trí bằng packer hiện tại — giữ size, không chồng, phủ thân/cành
  // (mosaic cũ thường dồn đỉnh tán; lock vẫn giữ đúng danh sách người)
  const spreadSlots = generatePhotoSlotsOnTree(
    Math.max(realLeavesRaw.length, resolution),
    hashEventId(event.eventId)
  );

  const realLeaves = realLeavesRaw.map((leaf, i) => {
    const slot = spreadSlots[i];
    if (!slot) return leaf;
    return {
      ...leaf,
      x: slot.x,
      y: slot.y,
      rotation: slot.rotation,
      scale: slot.scale,
    };
  });

  let leaves: TreeLeaf[] = [...realLeaves];

  // Filler vào các slot còn lại (không đè ảnh thật)
  if (realLeaves.length < spreadSlots.length) {
    const occupied = realLeaves.map((l) => ({ x: l.x, y: l.y }));
    let fillerIdx = 0;
    for (let i = realLeaves.length; i < spreadSlots.length; i++) {
      const slot = spreadSlots[i]!;
      const tooClose = occupied.some(
        (o) =>
          Math.hypot((o.x - slot.x) * 900, (o.y - slot.y) * 1100) < 48
      );
      if (tooClose) continue;
      leaves.push({
        id: `filler-${fillerIdx++}`,
        filler: true,
        slotIndex: i,
        x: slot.x,
        y: slot.y,
        rotation: slot.rotation,
        scale: slot.scale * 0.9,
        majorColor: brandColor,
        leafUrl: event.settings.fillerAssets[0] ?? null,
      });
      occupied.push({ x: slot.x, y: slot.y });
    }
  }

  const trunkSnap = mosaic.trunk_snapshot as
    | TreeLayout["trunk"]
    | null
    | undefined;
  const rootsSnap = mosaic.roots_snapshot as
    | TreeLayout["roots"]
    | null
    | undefined;

  const layout: TreeLayout = {
    shape: mosaic.shape,
    resolution,
    dimensions: { width: 900, height: 1100 },
    canopy: { x: 0.02, y: 0.06, w: 0.96, h: 0.42 },
    trunk: trunkSnap ?? {
      x: 0.44,
      y: 0.48,
      w: 0.12,
      h: 0.32,
      color: brandColor,
    },
    roots: rootsSnap ?? {
      text: event.settings.rootsText,
      y: 0.88,
    },
    leaves,
    totalSubmissions: realLeaves.length,
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
