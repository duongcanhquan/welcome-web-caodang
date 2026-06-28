"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { SEED_EVENT_ID } from "@/lib/constants";
import { AnimatedButton, GradientText, Stagger, StaggerItem } from "@/components/motion";

interface Submission {
  id: string;
  token: string;
  name: string;
  major: string;
  wish: string;
  leaf_url: string | null;
  photo_url: string | null;
  slot_index: number | null;
  hidden: boolean;
  created_at: string;
}

export function AdminSubmissionsPanel({
  eventId,
  eventSlug,
  eventStatus,
}: {
  eventId: string;
  eventSlug: string;
  eventStatus: string;
}) {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/submissions?eventId=${eventId}`);
    const data = (await res.json()) as { submissions: Submission[] };
    setSubs(data.submissions ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleHidden = async (id: string, hidden: boolean) => {
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !hidden }),
    });
    load();
  };

  const lockTree = async () => {
    if (
      !confirm(
        "Chốt cây sẽ khoá layout vĩnh viễn và mở link tìm-mình. Tiếp tục?"
      )
    ) {
      return;
    }

    setLocking(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/lock-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      confetti({ particleCount: 200, spread: 120 });
      setMessage(
        `Đã chốt cây v${data.version} — ${data.totalLeaves} lá 🌸`
      );
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLocking(false);
    }
  };

  const logout = async () => {
    await createClient().auth.signOut();
    window.location.href = "/admin";
  };

  const visible = subs.filter((s) => !s.hidden);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <Stagger>
        <StaggerItem>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <GradientText as="h1" className="font-display text-2xl font-bold">
                Admin — Kiểm duyệt
              </GradientText>
              <p className="text-sm text-ink-muted">
                {visible.length} / {subs.length} lá hiển thị ·{" "}
                {eventStatus === "locked" ? "🔒 Đã chốt" : "🌱 Đang thu thập"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/admin/settings", label: "Cài đặt AI" },
                { href: `/live/${eventSlug}`, label: "Màn LIVE", external: true },
                { href: `/v/${eventSlug}`, label: "Màn XEM", external: true },
              ].map((link) => (
                <motion.div key={link.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    className="inline-block rounded-button border border-peach/30 px-4 py-2 text-sm"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <button
                onClick={logout}
                className="text-sm text-ink-muted underline"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </StaggerItem>

        {eventStatus !== "locked" && (
          <StaggerItem>
            <AnimatedButton
              onClick={lockTree}
              disabled={locking || visible.length === 0}
              variant="sprout"
              className="w-full py-4 text-lg disabled:opacity-50"
            >
              {locking ? "Đang chốt…" : "🌸 Chốt cây — Khoá layout & mở tìm-mình"}
            </AnimatedButton>
          </StaggerItem>
        )}

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-card bg-sprout/10 px-4 py-3 text-center text-sprout"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </Stagger>

      {loading ? (
        <motion.p
          className="text-center text-ink-muted"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Đang tải…
        </motion.p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {subs.map((s, i) => (
            <motion.div
              key={s.id}
              className={`relative overflow-hidden rounded-card shadow-soft ${
                s.hidden ? "opacity-40 ring-2 ring-coral" : ""
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: s.hidden ? 0.4 : 1, scale: 1 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
              whileHover={{ y: -4, boxShadow: "0 8px 24px rgb(42 34 48 / 12%)" }}
              layout
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
                <p className="truncate text-sm font-semibold">{s.name}</p>
                <p className="truncate text-xs text-ink-muted">{s.major}</p>
              </div>
              <motion.button
                onClick={() => toggleHidden(s.id, s.hidden)}
                className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-white ${
                  s.hidden ? "bg-sprout" : "bg-coral"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {s.hidden ? "Hiện" : "Ẩn"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Default export wrapper with seed event */
export function AdminSubmissionsDefault() {
  return (
    <AdminSubmissionsPanel
      eventId={SEED_EVENT_ID}
      eventSlug="k2026"
      eventStatus="collecting"
    />
  );
}
