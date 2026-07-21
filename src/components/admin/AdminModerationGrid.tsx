"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import type { AdminSubmission } from "./AdminSubmissionsList";

interface AdminModerationGridProps {
  eventId: string;
}

export function AdminModerationGrid({ eventId }: AdminModerationGridProps) {
  const [subs, setSubs] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const toggleHidden = async (id: string, hidden: boolean) => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !hidden }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const removeSubmission = async (s: AdminSubmission) => {
    const ok = window.confirm(
      `Xoá vĩnh viễn «${s.name}»?\nẢnh và dữ liệu thần số sẽ bị xoá — không hoàn tác.`
    );
    if (!ok) return;

    setBusyId(s.id);
    try {
      const res = await fetch(`/api/admin/submissions/${s.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Xoá thất bại");
      }
      setSubs((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Xoá thất bại");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <motion.p
        className="py-12 text-center text-ink-muted"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Đang tải ảnh…
      </motion.p>
    );
  }

  if (subs.length === 0) {
    return (
      <p className="rounded-card bg-surface-warm py-12 text-center text-ink-muted">
        Chưa có ảnh để kiểm duyệt.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Kiểm duyệt ảnh
        </h2>
        <p className="text-base text-ink-muted">
          <strong className="text-coral">Ẩn</strong> = gỡ lá khỏi cây ·{" "}
          <strong className="text-coral">Xoá</strong> = xoá vĩnh viễn ·{" "}
          {subs.filter((s) => !s.hidden).length} đang hiển thị
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {subs.map((s, i) => (
          <motion.div
            key={s.id}
            className={`relative overflow-hidden rounded-card shadow-soft ${
              s.hidden ? "opacity-40 ring-2 ring-coral" : ""
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: s.hidden ? 0.4 : 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.02, 0.4) }}
            whileHover={{ y: -3 }}
          >
            {s.leaf_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.leaf_url}
                alt={s.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="aspect-square bg-surface-warm" />
            )}
            <div className="p-2">
              <p className="truncate text-base font-semibold">{s.name}</p>
              <p className="truncate text-sm text-ink-muted">{s.major}</p>
            </div>
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              <button
                type="button"
                disabled={busyId === s.id}
                onClick={() => void toggleHidden(s.id, s.hidden)}
                className={`rounded-full px-2 py-1 text-sm font-bold text-white disabled:opacity-50 ${
                  s.hidden ? "bg-sprout" : "bg-coral"
                }`}
              >
                {s.hidden ? "Hiện" : "Ẩn"}
              </button>
              <button
                type="button"
                disabled={busyId === s.id}
                onClick={() => void removeSubmission(s)}
                className="rounded-full bg-foreground/85 px-2 py-1 text-sm font-bold text-white disabled:opacity-50"
              >
                {busyId === s.id ? "…" : "Xoá"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
