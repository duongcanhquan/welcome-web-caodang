"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { GradientText } from "@/components/motion";
import { normalizeSlug } from "@/lib/events/slug";

export interface AdminEventRow {
  id: string;
  slug: string;
  name: string;
  status: string;
  is_active: boolean;
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
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
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
      const hint = /is_active|column/i.test(message)
        ? " — có thể chưa chạy migration is_active trên Supabase"
        : "";
      setError(message + hint);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === normalizeSlug(name)) {
      setSlug(normalizeSlug(value));
    }
  };

  const create = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          lockActiveFirst: lockFirst,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        event?: { slug: string };
      };
      if (!res.ok) throw new Error(data.error ?? "Không tạo được");
      setName("");
      setSlug("");
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

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-card border border-peach/20 bg-surface/90 p-6 shadow-soft backdrop-blur-sm">
        <GradientText as="h2" className="font-display text-2xl font-bold">
          Cây & lịch sử
        </GradientText>
        <p className="mt-1 text-base text-ink-muted">
          Giữ cây cũ để xem lại / tải về. Tạo cây mới khi bắt đầu lớp khác.
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
                    <div>
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
          Tạo cây mới
        </h3>
        <p className="mt-1 text-base text-ink-muted">
          Cây cũ được giữ nguyên. Form join sẽ chuyển sang cây mới.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-base">
            <span className="mb-1 block font-semibold text-ink-muted">
              Tên sự kiện
            </span>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Cây Khóa 2027 — Việt Mỹ"
              className="w-full rounded-xl border border-peach/25 bg-surface-warm px-3 py-2 text-base outline-none focus:border-peach"
            />
          </label>
          <label className="block text-base">
            <span className="mb-1 block font-semibold text-ink-muted">
              Slug (URL)
            </span>
            <input
              value={slug}
              onChange={(e) => setSlug(normalizeSlug(e.target.value))}
              placeholder="k2027"
              className="w-full rounded-xl border border-peach/25 bg-surface-warm px-3 py-2 text-base outline-none focus:border-peach"
            />
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
            Khoá cây đang chạy trước khi tạo mới (khuyến nghị — giữ layout cũ
            để xem lại)
          </span>
        </label>
        <button
          type="button"
          disabled={creating || !name.trim() || !slug.trim()}
          onClick={() => void create()}
          className="mt-4 rounded-full bg-brand-navy px-5 py-2.5 text-base font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          {creating ? "Đang tạo…" : "Tạo cây mới"}
        </button>
      </div>
    </motion.section>
  );
}
