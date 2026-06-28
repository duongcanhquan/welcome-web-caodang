import { createAdminClient } from "@/lib/supabase/admin";
import { buildTreeLayout, layoutToMosaicLeaves } from "@/lib/tree";
import { getEventTreeData } from "@/lib/tree/get-layout";
import type { SubmissionForLayout } from "@/lib/tree/types";

/** Admin chốt cây — khoá layout vĩnh viễn + cập nhật vị trí submission */
export async function lockTree(eventId: string): Promise<{
  version: number;
  totalLeaves: number;
}> {
  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, slug, status")
    .eq("id", eventId)
    .single();

  if (!event) throw new Error("Sự kiện không tồn tại");
  if (event.status === "locked") {
    throw new Error("Cây đã được chốt trước đó");
  }

  const eventData = await getEventTreeData(event.slug);
  if (!eventData) throw new Error("Không tải được cấu hình");

  const { data: submissions } = await admin
    .from("submissions")
    .select(
      "id, token, name, major, wish, leaf_url, photo_url, slot_index, hidden"
    )
    .eq("event_id", eventId)
    .order("slot_index", { ascending: true });

  const layout = buildTreeLayout(
    (submissions ?? []) as SubmissionForLayout[],
    eventData.settings,
    eventId.charCodeAt(0) * 1000
  );

  // Cập nhật x,y,rotation,scale vào từng submission
  for (const leaf of layout.leaves) {
    if (!leaf.submissionId || leaf.filler) continue;
    await admin
      .from("submissions")
      .update({
        x: leaf.x,
        y: leaf.y,
        rotation: leaf.rotation,
        scale: leaf.scale,
      })
      .eq("id", leaf.submissionId);
  }

  // Version mới
  const { data: lastMosaic } = await admin
    .from("mosaics")
    .select("version")
    .eq("event_id", eventId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = (lastMosaic?.version ?? 0) + 1;

  await admin.from("mosaics").insert({
    event_id: eventId,
    version,
    shape: layout.shape,
    resolution: layout.resolution,
    trunk_snapshot: layout.trunk,
    roots_snapshot: layout.roots,
    leaves: layoutToMosaicLeaves(layout),
  });

  await admin
    .from("events")
    .update({ status: "locked" })
    .eq("id", eventId);

  return {
    version,
    totalLeaves: layout.totalSubmissions,
  };
}
