import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT_MAJORS } from "@/lib/constants";
import { composeEventName } from "@/lib/events/labels";
import { isValidSlug, normalizeSlug } from "@/lib/events/slug";
import { softLockEvent } from "@/lib/tree/lock-tree";
import type { EventSettings } from "@/lib/types/database";

export { normalizeSlug } from "@/lib/events/slug";

function defaultSettings(eventId: string): EventSettings {
  const majors = [...EVENT_MAJORS];
  const majorColors: Record<string, string> = {};
  const palette = [
    "#3DBE8B",
    "#FF6FA5",
    "#FFAE3B",
    "#FF6B5A",
    "#FFD15C",
    "#6B8CFF",
    "#FF8FAB",
    "#B8A9C9",
    "#4ECDC4",
    "#95E1D3",
  ];
  majors.forEach((m, i) => {
    majorColors[m] = palette[i % palette.length];
  });

  return {
    event_id: eventId,
    shape: "tree",
    majors,
    fill_ratio: 0.9,
    leaves_min: 40,
    leaves_max: 1500,
    blossom_every: 50,
    filler_assets: [],
    trunk_config: { brandColor: "#3DBE8B", images: [] },
    roots_text: "",
    max_file_mb: 5,
    rate_limit_per_ip: 3,
    major_colors: majorColors,
    policy_url: "/privacy",
    updated_at: new Date().toISOString(),
  };
}

export async function createEvent(input: {
  name?: string;
  slug: string;
  batchLabel: string;
  classLabel?: string;
  /** Khoá nhanh đợt đang chạy (mosaic chạy nền sau) */
  lockActiveFirst?: boolean;
}): Promise<{
  id: string;
  slug: string;
  name: string;
  batch_label: string;
  class_label: string;
  /** Event cũ cần build mosaic nền — API gọi after() */
  mosaicAfterId: string | null;
}> {
  const batchLabel = input.batchLabel.trim();
  const classLabel = (input.classLabel ?? "").trim();
  const name =
    (input.name ?? "").trim() || composeEventName(batchLabel, classLabel);
  const slug = normalizeSlug(input.slug);

  if (!batchLabel) throw new Error("Thiếu tên đợt (vd. Orientation 21/07/2026)");
  if (!name) throw new Error("Thiếu tên sự kiện");
  if (!isValidSlug(slug)) {
    throw new Error("Slug không hợp lệ (chỉ a-z, 0-9, dấu gạch ngang)");
  }

  const admin = createAdminClient();

  const [{ data: existing }, { data: active }] = await Promise.all([
    admin.from("events").select("id").eq("slug", slug).maybeSingle(),
    admin
      .from("events")
      .select("id, status")
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  if (existing) throw new Error(`Slug "${slug}" đã tồn tại`);

  let mosaicAfterId: string | null = null;

  if (active?.status === "collecting") {
    if (!input.lockActiveFirst) {
      throw new Error(
        "Cây đang chạy chưa chốt. Bật «Khoá cây hiện tại trước» hoặc chốt cây trong tab Tổng quan."
      );
    }
    // Soft lock tức thì — không chờ mosaic (tránh «Đang tạo…» lâu)
    await softLockEvent(active.id);
    mosaicAfterId = active.id;
  }

  let sourceSettings: EventSettings | null = null;
  if (active) {
    const { data } = await admin
      .from("event_settings")
      .select("*")
      .eq("event_id", active.id)
      .maybeSingle();
    sourceSettings = data as EventSettings | null;
  }

  const { data: created, error: createErr } = await admin
    .from("events")
    .insert({
      slug,
      name,
      batch_label: batchLabel,
      class_label: classLabel,
      status: "collecting",
      is_active: false,
    })
    .select("id, slug, name, batch_label, class_label")
    .single();

  if (createErr || !created) {
    throw new Error(createErr?.message ?? "Không tạo được sự kiện");
  }

  const settings: EventSettings = sourceSettings
    ? {
        event_id: created.id,
        shape: sourceSettings.shape || "tree",
        majors: Array.isArray(sourceSettings.majors)
          ? sourceSettings.majors
          : [...EVENT_MAJORS],
        fill_ratio: Number(sourceSettings.fill_ratio) || 0.9,
        leaves_min: Number(sourceSettings.leaves_min) || 40,
        leaves_max: Number(sourceSettings.leaves_max) || 1500,
        blossom_every: Number(sourceSettings.blossom_every) || 50,
        filler_assets: Array.isArray(sourceSettings.filler_assets)
          ? sourceSettings.filler_assets
          : [],
        trunk_config: sourceSettings.trunk_config ?? {
          brandColor: "#3DBE8B",
          images: [],
        },
        roots_text: name,
        max_file_mb: Number(sourceSettings.max_file_mb) || 5,
        rate_limit_per_ip: Number(sourceSettings.rate_limit_per_ip) || 3,
        major_colors: sourceSettings.major_colors ?? {},
        policy_url: sourceSettings.policy_url ?? "/privacy",
        updated_at: new Date().toISOString(),
      }
    : { ...defaultSettings(created.id), roots_text: name };

  const { error: settingsErr } = await admin
    .from("event_settings")
    .insert(settings);
  if (settingsErr) {
    await admin.from("events").delete().eq("id", created.id);
    throw new Error(settingsErr.message);
  }

  const { error: clearErr } = await admin
    .from("events")
    .update({ is_active: false })
    .eq("is_active", true);
  if (clearErr) throw new Error(clearErr.message);

  const { error: activateErr } = await admin
    .from("events")
    .update({ is_active: true })
    .eq("id", created.id);
  if (activateErr) throw new Error(activateErr.message);

  return { ...created, mosaicAfterId };
}

export async function setActiveEvent(eventId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("id, status")
    .eq("id", eventId)
    .single();

  if (!event) throw new Error("Sự kiện không tồn tại");
  if (event.status === "locked") {
    throw new Error(
      "Không thể đặt cây đã chốt làm cây đang chạy — hãy tạo cây mới"
    );
  }

  const { error: clearErr } = await admin
    .from("events")
    .update({ is_active: false })
    .eq("is_active", true);
  if (clearErr) throw new Error(clearErr.message);

  const { error: activateErr } = await admin
    .from("events")
    .update({ is_active: true })
    .eq("id", eventId);
  if (activateErr) throw new Error(activateErr.message);
}
