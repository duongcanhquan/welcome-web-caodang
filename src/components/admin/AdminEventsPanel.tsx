"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { EventCohortBadge } from "@/components/events/EventCohortBadge";
import { GradientText } from "@/components/motion";
import { composeEventName } from "@/lib/events/labels";
import { normalizeSlug } from "@/lib/events/slug";

export interface AdminEventRow {
  id: string;
  slug: string;
  name: string;
  status: string;
  is_active: boolean;
  batch_label: string;
  class_label: string;
  created_at: string;
  submissionCount: number;
}

interface AdminEventsPanelProps {
  currentEventId: string;
}

export function AdminEventsPanel({ currentEventId }: AdminEventsPanelProps) {
  const router = useRouter();
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batchLabel, setBatchLabel] = useState("");
  const [classLabel, setClassLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [lockFirst, setLockFirst] = useState(true);
  const [creating, setCreating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events");
      const data = (await res.json()) as {
        events?: AdminEventRow[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Không tải được danh sách");
      setEvents(data.events ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi tải";
      const hint = /is_active|batch_label|column/i.test(message)
        ? " — có thể chưa chạy migration nhãn đợt/lớp trên Supabase"
        : "";
      setError(message + hint);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const syncSlugFromLabels = (batch: string, klass: string) => {
    if (slugTouched) return;
    const composed = composeEventName(batch, klass);
    if (composed) setSlug(normalizeSlug(composed));
  };

  const create = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchLabel,
          classLabel,
          slug,
          lockActiveFirst: lockFirst,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        event?: { slug: string };
      };
      if (!res.ok) throw new Error(data.error ?? "Không tạo được");
      setBatchLabel("");
      setClassLabel("");
      setSlug("");
      setSlugTouched(false);
      await load();
      if (data.event?.slug) {
        router.push(`/admin/submissions?event=${data.event.slug}&tab=cay`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tạo");
    } finally {
      setCreating(false);
    }
  };

  const activate = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Không kích hoạt được");
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  const download = async (id: string, format: "csv" | "zip" | "png") => {
    const key = `${id}-${format}`;
    setDownloading(key);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${id}/export?format=${format}`);
      if (!res.ok) {
        let message = "Tải thất bại";
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          /* body không phải JSON */
        }
        throw new Error(message);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const match = cd?.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `export.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải");
    } finally {
      setDownloading(null);
    }
  };

  const previewName = composeEventName(batchLabel, classLabel);

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-card border border-peach/20 bg-surface/90 p-6 shadow-soft backdrop-blur-sm">
        <GradientText as="h2" className="font-display text-2xl font-bold">
          Cây theo đợt / lớp
        </GradientText>
        <p className="mt-1 text-base text-ink-muted">
          Mỗi đợt (hoặc lớp) = một cây riêng. Dữ liệu không lẫn nhau. Chỉ{" "}
          <strong>một</strong> cây «Đang chạy» nhận form join mặc định.
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-base text-coral">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-4 text-base text-ink-muted">Đang tải…</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {events.map((ev) => {
              const isCurrent = ev.id === currentEventId;
              return (
                <li
                  key={ev.id}
                  className={`rounded-xl border px-4 py-3 ${
                    isCurrent
                      ? "border-brand-navy/40 bg-brand-navy/5"
                      : "border-peach/20 bg-surface-warm/40"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <EventCohortBadge
                        batchLabel={ev.batch_label}
                        classLabel={ev.class_label}
                        name={ev.name}
                        slug={ev.slug}
                      />
                      <p className="font-semibold text-foreground">
                        {ev.name}
                        {ev.is_active && (
                          <span className="ml-2 rounded-full bg-brand-navy px-2 py-0.5 text-sm font-bold text-white">
                            Đang chạy
                          </span>
                        )}
                        {ev.status === "locked" && (
                          <span className="ml-2 rounded-full bg-peach/20 px-2 py-0.5 text-sm font-bold text-peach">
                            Đã chốt
                          </span>
                        )}
                        {isCurrent && (
                          <span className="ml-2 rounded-full bg-sprout/20 px-2 py-0.5 text-sm font-bold text-sprout">
                            Đang quản lý
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-ink-muted">
                        <code>{ev.slug}</code> · {ev.submissionCount} bài nộp ·{" "}
                        {new Date(ev.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        href={`/admin/submissions?event=${ev.slug}&tab=tong-quan`}
                        className="rounded-lg border border-peach/25 px-2.5 py-1 text-sm font-semibold hover:bg-surface-warm"
                      >
                        Quản lý
                      </Link>
                      <Link
                        href={`/join?event=${ev.slug}`}
                        target="_blank"
                        className="rounded-lg border border-peach/25 px-2.5 py-1 text-sm font-semibold hover:bg-surface-warm"
                      >
                        Form đợt này
                      </Link>
                      <Link
                        href={`/live/${ev.slug}`}
                        target="_blank"
                        className="rounded-lg border border-peach/25 px-2.5 py-1 text-sm font-semibold hover:bg-surface-warm"
                      >
                        Live
                      </Link>
                      <Link
                        href={`/v/${ev.slug}`}
                        target="_blank"
                        className="rounded-lg border border-peach/25 px-2.5 py-1 text-sm font-semibold hover:bg-surface-warm"
                      >
                        Xem lại
                      </Link>
                      {ev.status === "collecting" && !ev.is_active && (
                        <button
                          type="button"
                          onClick={() => void activate(ev.id)}
                          className="rounded-lg border border-brand-navy/30 px-2.5 py-1 text-sm font-semibold text-brand-navy hover:bg-brand-navy/10"
                        >
                          Đặt đang chạy
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(
                      [
                        ["csv", "CSV"],
                        ["zip", "ZIP ảnh"],
                        ["png", "PNG cây"],
                      ] as const
                    ).map(([fmt, label]) => (
                      <button
                        key={fmt}
                        type="button"
                        disabled={downloading === `${ev.id}-${fmt}`}
                        onClick={() => void download(ev.id, fmt)}
                        className="rounded-lg bg-surface px-2.5 py-1 text-sm font-semibold text-ink-muted ring-1 ring-peach/20 transition hover:text-foreground disabled:opacity-50"
                      >
                        {downloading === `${ev.id}-${fmt}`
                          ? "Đang tải…"
                          : `↓ ${label}`}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-card border border-peach/20 bg-surface/90 p-6 shadow-soft backdrop-blur-sm">
        <h3 className="font-display text-xl font-bold text-foreground">
          Tạo cây cho đợt / lớp mới
        </h3>
        <div className="mt-2 space-y-2 rounded-xl bg-brand-navy/5 px-3 py-3 text-sm text-ink-muted ring-1 ring-peach/15">
          <p className="font-semibold text-foreground">Quy trình nhanh (khuyến nghị)</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>
              <strong>Tạo đợt mới trước</strong> → nhận slug / link form riêng
            </li>
            <li>
              Gửi link <code className="text-xs">/join?event=slug-đợt</code> cho
              sinh viên nộp ảnh
            </li>
            <li>
              Xem Live realtime → hết buổi bấm <strong>Chốt cây</strong>
            </li>
          </ol>
          <p className="pt-1">
            Có thể dùng đợt đang chạy sẵn (không tạo mới) nếu chỉ một buổi /
            một lớp. <strong>Không</strong> nên để sinh viên nộp xong rồi mới tạo
            đợt — ảnh sẽ nằm nhầm đợt cũ.
          </p>
        </div>
        <p className="mt-3 text-base text-ink-muted">
          Điền rõ <strong>đợt</strong> và (nếu cần) <strong>lớp</strong>. Form
          mặc định <code>/join</code> luôn trỏ đợt <strong>Đang chạy</strong>.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-base sm:col-span-2">
            <span className="mb-1 block font-semibold text-ink-muted">
              Đợt <span className="text-coral">*</span>
            </span>
            <input
              value={batchLabel}
              onChange={(e) => {
                const v = e.target.value;
                setBatchLabel(v);
                syncSlugFromLabels(v, classLabel);
              }}
              placeholder="VD: Orientation 21/07/2026"
              className="w-full rounded-xl border border-peach/25 bg-surface-warm px-3 py-2 text-base outline-none focus:border-peach"
            />
          </label>
          <label className="block text-base sm:col-span-2">
            <span className="mb-1 block font-semibold text-ink-muted">
              Lớp / buổi (tuỳ chọn)
            </span>
            <input
              value={classLabel}
              onChange={(e) => {
                const v = e.target.value;
                setClassLabel(v);
                syncSlugFromLabels(batchLabel, v);
              }}
              placeholder="VD: Marketing sáng · CNTT chiều"
              className="w-full rounded-xl border border-peach/25 bg-surface-warm px-3 py-2 text-base outline-none focus:border-peach"
            />
          </label>
          <label className="block text-base sm:col-span-2">
            <span className="mb-1 block font-semibold text-ink-muted">
              Slug (URL riêng cho đợt này)
            </span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(normalizeSlug(e.target.value));
              }}
              placeholder="orientation-2107-marketing"
              className="w-full rounded-xl border border-peach/25 bg-surface-warm px-3 py-2 text-base outline-none focus:border-peach"
            />
            <span className="mt-1 block text-sm text-ink-muted">
              Link form: <code>/join?event={slug || "…"}</code>
              {previewName ? (
                <>
                  {" "}
                  · Tên cây: <strong>{previewName}</strong>
                </>
              ) : null}
            </span>
          </label>
        </div>
        <label className="mt-3 flex items-start gap-2 text-base text-ink-muted">
          <input
            type="checkbox"
            checked={lockFirst}
            onChange={(e) => setLockFirst(e.target.checked)}
            className="mt-1"
          />
          <span>
            Khoá đợt đang chạy trước (nhanh — mosaic lưu nền). Giữ cây cũ để xem
            lại / CSV.
          </span>
        </label>
        <button
          type="button"
          disabled={creating || !batchLabel.trim() || !slug.trim()}
          onClick={() => void create()}
          className="mt-4 rounded-full bg-brand-navy px-5 py-2.5 text-base font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          {creating ? "Đang tạo…" : "Tạo cây đợt này"}
        </button>
      </div>
    </motion.section>
  );
}
