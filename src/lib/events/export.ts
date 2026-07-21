import JSZip from "jszip";
import sharp from "sharp";
import { toOwnedBuffer } from "@/lib/buffer/owned";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MosaicLeaf } from "@/lib/types/database";

/** Tỉ lệ canvas layout cây (build-layout) */
const LAYOUT_W = 900;
const LAYOUT_H = 1100;

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportFileBase(event: {
  slug: string;
  batch_label?: string | null;
  class_label?: string | null;
}): string {
  const raw = [event.batch_label, event.class_label, event.slug]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return raw || event.slug;
}

export async function exportSubmissionsCsv(eventId: string): Promise<{
  filename: string;
  body: string;
}> {
  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("slug, batch_label, class_label")
    .eq("id", eventId)
    .single();
  if (!event) throw new Error("Sự kiện không tồn tại");

  const { data: rows, error } = await admin
    .from("submissions")
    .select(
      "token, name, dob, major, wish, leaf_url, photo_url, hidden, slot_index, created_at"
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const header = [
    "token",
    "name",
    "dob",
    "major",
    "wish",
    "leaf_url",
    "photo_url",
    "hidden",
    "slot_index",
    "created_at",
  ];

  const lines = [header.join(",")];
  for (const r of rows ?? []) {
    lines.push(
      [
        csvEscape(r.token ?? ""),
        csvEscape(r.name ?? ""),
        csvEscape(r.dob ?? ""),
        csvEscape(r.major ?? ""),
        csvEscape(r.wish ?? ""),
        csvEscape(r.leaf_url ?? ""),
        csvEscape(r.photo_url ?? ""),
        r.hidden ? "1" : "0",
        r.slot_index != null ? String(r.slot_index) : "",
        csvEscape(r.created_at ?? ""),
      ].join(",")
    );
  }

  return {
    filename: `${exportFileBase(event)}-submissions.csv`,
    body: "\uFEFF" + lines.join("\n"),
  };
}

async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return toOwnedBuffer(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export function extensionFromUrl(url: string): string {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".png")) return "png";
  if (path.endsWith(".webp")) return "webp";
  if (path.endsWith(".gif")) return "gif";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "jpg";
  return "webp";
}

function safeFilename(base: string, ext: string): string {
  const clean = base
    .replace(/[^\p{L}\p{N}\-_]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${clean || "file"}.${ext}`;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(1, items.length)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export async function exportPhotosZip(eventId: string): Promise<{
  filename: string;
  body: Buffer;
}> {
  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("slug, batch_label, class_label")
    .eq("id", eventId)
    .single();
  if (!event) throw new Error("Sự kiện không tồn tại");

  const { data: rows, error } = await admin
    .from("submissions")
    .select("token, name, photo_url, leaf_url, hidden")
    .eq("event_id", eventId)
    .eq("hidden", false)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const zip = new JSZip();
  const list = (rows ?? []).filter((r) => r.photo_url || r.leaf_url);

  const fetched = await mapPool(list, 6, async (r) => {
    const photoUrl = r.photo_url || r.leaf_url;
    if (!photoUrl) return null;
    const buf = await fetchBuffer(photoUrl);
    if (!buf) return null;
    const ext = extensionFromUrl(photoUrl);
    const name = safeFilename(`${r.token}-${r.name}`, ext);
    return { name, buf };
  });

  let added = 0;
  for (const item of fetched) {
    if (!item) continue;
    zip.file(`photos/${item.name}`, item.buf);
    added += 1;
  }

  if (added === 0) {
    zip.file("README.txt", "Không có ảnh nào để tải.\n");
  }

  const body = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return {
    filename: `${exportFileBase(event)}-photos.zip`,
    body: Buffer.from(body),
  };
}

export async function exportTreePng(eventId: string): Promise<{
  filename: string;
  body: Buffer;
}> {
  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("slug, name, batch_label, class_label")
    .eq("id", eventId)
    .single();
  if (!event) throw new Error("Sự kiện không tồn tại");

  const { data: mosaic } = await admin
    .from("mosaics")
    .select("leaves, resolution")
    .eq("event_id", eventId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: submissions } = await admin
    .from("submissions")
    .select("id, photo_url, leaf_url, x, y, scale, hidden")
    .eq("event_id", eventId)
    .eq("hidden", false);

  const byId = new Map((submissions ?? []).map((s) => [s.id, s]));
  const canvasW = 1600;
  const canvasH = Math.round((canvasW * LAYOUT_H) / LAYOUT_W);
  const leafSize = 72;

  const base = sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 13, g: 61, b: 107 },
    },
  });

  type Comp = { input: Buffer; left: number; top: number };
  const composites: Comp[] = [];

  const mosaicLeaves = (mosaic?.leaves ?? []) as MosaicLeaf[];

  if (mosaicLeaves.length > 0) {
    const realLeaves = mosaicLeaves.filter(
      (leaf) => !leaf.filler && leaf.submission_id
    );

    const parts = await mapPool(realLeaves, 6, async (leaf) => {
      const sub = byId.get(leaf.submission_id!);
      // leaf_url = ảnh gắn tán (vuông nhỏ), phù hợp collage cây
      const url = sub?.leaf_url || sub?.photo_url;
      if (!url) return null;
      const raw = await fetchBuffer(url);
      if (!raw) return null;
      const size = Math.max(24, Math.round(leafSize * (leaf.scale || 1)));
      const resized = await sharp(raw)
        .resize(size, size, { fit: "cover" })
        .png()
        .toBuffer();
      const left = Math.min(
        canvasW - size,
        Math.max(0, Math.round(leaf.x * canvasW - size / 2))
      );
      const top = Math.min(
        canvasH - size,
        Math.max(0, Math.round(leaf.y * canvasH - size / 2))
      );
      return { input: resized, left, top };
    });

    for (const p of parts) {
      if (p) composites.push(p);
    }
  } else {
    const visible = (submissions ?? []).filter((s) => s.leaf_url || s.photo_url);
    const cols = Math.max(1, Math.ceil(Math.sqrt(visible.length || 1)));
    const cell = Math.floor(Math.min(canvasW, canvasH) / cols);
    const pad = 4;

    const parts = await mapPool(visible, 6, async (sub, i) => {
      const url = sub.leaf_url || sub.photo_url;
      if (!url) return null;
      const raw = await fetchBuffer(url);
      if (!raw) return null;
      const size = Math.max(16, cell - pad * 2);
      const resized = await sharp(raw)
        .resize(size, size, { fit: "cover" })
        .png()
        .toBuffer();
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        input: resized,
        left: col * cell + pad,
        top: row * cell + pad,
      };
    });

    for (const p of parts) {
      if (p) composites.push(p);
    }
  }

  const body =
    composites.length > 0
      ? await base.composite(composites).png().toBuffer()
      : await base.png().toBuffer();

  return {
    filename: `${exportFileBase(event)}-tree.png`,
    body,
  };
}
