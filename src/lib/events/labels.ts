import type { Event } from "@/lib/types/database";

export type EventLabelFields = Pick<
  Event,
  "name" | "slug" | "batch_label" | "class_label"
>;

/** Ghép tên hiển thị từ đợt + lớp (khi tạo sự kiện) */
export function composeEventName(batchLabel: string, classLabel: string): string {
  const batch = batchLabel.trim();
  const klass = classLabel.trim();
  if (batch && klass) return `${batch} — ${klass}`;
  if (batch) return batch;
  if (klass) return klass;
  return "";
}

/** Dòng ngắn cho badge / header — ưu tiên đợt + lớp */
export function formatEventCohort(ev: EventLabelFields): string {
  const batch = (ev.batch_label || "").trim();
  const klass = (ev.class_label || "").trim();
  if (batch && klass) return `${batch} · ${klass}`;
  if (batch) return batch;
  if (klass) return klass;
  return ev.name?.trim() || ev.slug;
}

/** Tiêu đề đầy đủ khi cần (admin list, export) */
export function formatEventTitle(ev: EventLabelFields): string {
  const cohort = formatEventCohort(ev);
  if (ev.name?.trim() && ev.name.trim() !== cohort) {
    return `${ev.name.trim()} (${cohort})`;
  }
  return cohort;
}
