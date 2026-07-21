import { createAdminClient } from "@/lib/supabase/admin";
import { buildTreeLayout, layoutToMosaicLeaves } from "@/lib/tree";
import type { LayoutSettings } from "@/lib/tree";
import type { SubmissionForLayout } from "@/lib/tree/types";

/**
 * Admin chốt cây — lưu mosaic (chỉ lá thật) + khoá event.
 * Ít round-trip DB để chốt nhanh.
 */
export async function lockTree(
  eventId: string,
  options?: { forceRebuild?: boolean }
): Promise<{
  version: number;
  totalLeaves: number;
}> {
  const admin = createAdminClient();

  const [{ data: event }, { data: settingsRow }, { data: submissions }, { data: lastMosaic }] =
    await Promise.all([
      admin.from("events").select("id, slug, status").eq("id", eventId).single(),
      admin.from("event_settings").select("*").eq("event_id", eventId).maybeSingle(),
      admin
        .from("submissions")
        .select(
          "id, token, name, major, wish, leaf_url, photo_url, slot_index, hidden"
        )
        .eq("event_id", eventId)
        .order("slot_index", { ascending: true }),
      admin
        .from("mosaics")
        .select("version, leaves")
        .eq("event_id", eventId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (!event) throw new Error("Sự kiện không tồn tại");
  if (!settingsRow) throw new Error("Không tải được cấu hình");

  const alreadyLocked = event.status === "locked";
  if (alreadyLocked && !options?.forceRebuild) {
    const leafCount = Array.isArray(lastMosaic?.leaves)
      ? (lastMosaic.leaves as unknown[]).filter(
          (l) =>
            l &&
            typeof l === "object" &&
            !(l as { filler?: boolean }).filler &&
            (l as { submission_id?: string }).submission_id
        ).length
      : 0;

    if (lastMosaic && leafCount > 0) {
      throw new Error("Cây đã được chốt trước đó");
    }
  }

  const settings: LayoutSettings = {
    shape: settingsRow.shape,
    fillRatio: Number(settingsRow.fill_ratio),
    leavesMin: settingsRow.leaves_min,
    leavesMax: settingsRow.leaves_max,
    blossomEvery: settingsRow.blossom_every,
    fillerAssets: (settingsRow.filler_assets as string[]) ?? [],
    trunkConfig:
      (settingsRow.trunk_config as LayoutSettings["trunkConfig"]) ?? {},
    rootsText: settingsRow.roots_text ?? "",
    majorColors: (settingsRow.major_colors as Record<string, string>) ?? {},
  };

  const layout = buildTreeLayout(
    (submissions ?? []) as SubmissionForLayout[],
    settings,
    hashId(eventId)
  );

  const version = (lastMosaic?.version ?? 0) + 1;
  const mosaicLeaves = layoutToMosaicLeaves(layout);

  const [{ error: mosaicErr }, { error: lockErr }] = await Promise.all([
    admin.from("mosaics").insert({
      event_id: eventId,
      version,
      shape: layout.shape,
      resolution: layout.resolution,
      trunk_snapshot: layout.trunk,
      roots_snapshot: layout.roots,
      leaves: mosaicLeaves,
    }),
    admin.from("events").update({ status: "locked" }).eq("id", eventId),
  ]);

  if (mosaicErr) {
    throw new Error(`Không lưu được mosaic: ${mosaicErr.message}`);
  }
  if (lockErr) {
    throw new Error(`Không khoá được sự kiện: ${lockErr.message}`);
  }

  return {
    version,
    totalLeaves: layout.totalSubmissions,
  };
}

/** Khoá nhanh (chỉ status) — mosaic chạy nền sau */
export async function softLockEvent(eventId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("events")
    .update({ status: "locked", is_active: false })
    .eq("id", eventId)
    .eq("status", "collecting");
  if (error) throw new Error(error.message);
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 42;
}
