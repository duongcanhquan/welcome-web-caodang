"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

export interface AdminSubmission {
  id: string;
  token: string;
  name: string;
  dob: string;
  major: string;
  wish: string;
  leaf_url: string | null;
  photo_url: string | null;
  slot_index: number | null;
  hidden: boolean;
  created_at: string;
}

function formatDob(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN");
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AdminSubmissionsListProps {
  eventId: string;
  eventSlug: string;
}

export function AdminSubmissionsList({
  eventId,
  eventSlug,
}: AdminSubmissionsListProps) {
  const [subs, setSubs] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/submissions?eventId=${eventId}`);
    const data = (await res.json()) as { submissions: AdminSubmission[] };
    setSubs(data.submissions ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const removeSubmission = async (s: AdminSubmission) => {
    const ok = window.confirm(
      `Xoá vĩnh viễn bài của «${s.name}»?\nẢnh, thần số học và điểm game sẽ bị xoá — không hoàn tác.`
    );
    if (!ok) return;

    setDeletingId(s.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${s.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Xoá thất bại");
      setSubs((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Xoá thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subs;
    return subs.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.major.toLowerCase().includes(q)
    );
  }, [subs, query]);

  if (loading) {
    return (
      <motion.p
        className="py-12 text-center text-ink-muted"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Đang tải danh sách…
      </motion.p>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Danh sách đã nộp
          </h2>
          <p className="text-base text-ink-muted">
            {filtered.length} / {subs.length} bạn · hiển thị{" "}
            {subs.filter((s) => !s.hidden).length} lá trên cây · có thể{" "}
            <strong className="text-coral">xoá</strong> bài nộp
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tên hoặc ngành…"
          className="w-full max-w-xs rounded-card border-2 border-peach/20 bg-surface px-4 py-2 text-base focus:border-peach focus:outline-none"
        />
      </div>

      {actionError && (
        <p className="rounded-lg bg-coral/10 px-3 py-2 text-base text-coral">
          {actionError}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-card bg-surface-warm py-12 text-center text-ink-muted">
          {subs.length === 0
            ? "Chưa có ai nộp ảnh — chia sẻ link /join cho sinh viên."
            : "Không tìm thấy kết quả phù hợp."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-peach/15 bg-surface/90 shadow-soft">
          <table className="w-full min-w-[640px] text-left text-base">
            <thead>
              <tr className="border-b border-peach/15 bg-surface-warm/80 text-sm font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Ảnh</th>
                <th className="px-3 py-3">Họ tên</th>
                <th className="px-3 py-3">Ngành</th>
                <th className="px-3 py-3">Ngày sinh</th>
                <th className="px-3 py-3">Nộp lúc</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-3 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-peach/10 transition hover:bg-surface-warm/50 ${
                    s.hidden ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-3 py-3 text-ink-muted">{i + 1}</td>
                  <td className="px-3 py-3">
                    {s.leaf_url || s.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.leaf_url ?? s.photo_url ?? ""}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-peach/20"
                      />
                    ) : (
                      <span className="inline-block h-10 w-10 rounded-full bg-surface-warm" />
                    )}
                  </td>
                  <td className="px-3 py-3 font-semibold text-foreground">{s.name}</td>
                  <td className="max-w-[140px] truncate px-3 py-3 text-ink-muted">
                    {s.major}
                  </td>
                  <td className="px-3 py-3 text-ink-muted">{formatDob(s.dob)}</td>
                  <td className="px-3 py-3 text-sm text-ink-muted">
                    {formatTime(s.created_at)}
                  </td>
                  <td className="px-3 py-3">
                    {s.hidden ? (
                      <span className="rounded-full bg-coral/15 px-2 py-0.5 text-sm font-semibold text-coral">
                        Đã ẩn
                      </span>
                    ) : (
                      <span className="rounded-full bg-sprout/15 px-2 py-0.5 text-sm font-semibold text-sprout">
                        Hiển thị
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/me/${s.token}`}
                        target="_blank"
                        className="text-sm font-semibold text-peach underline"
                      >
                        Thần số
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === s.id}
                        onClick={() => void removeSubmission(s)}
                        className="rounded-lg border border-coral/40 px-2 py-1 text-sm font-bold text-coral transition hover:bg-coral/10 disabled:opacity-50"
                      >
                        {deletingId === s.id ? "Đang xoá…" : "Xoá"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {eventSlug && subs.length > 0 && (
        <p className="text-center text-sm text-ink-muted">
          Form sinh viên:{" "}
          <Link href="/join" target="_blank" className="text-peach underline">
            /join
          </Link>
        </p>
      )}
    </section>
  );
}
