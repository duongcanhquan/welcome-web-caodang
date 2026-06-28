"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedButton } from "@/components/motion";

interface AdminLockTreeProps {
  eventId: string;
  eventSlug: string;
}

export function AdminLockTree({ eventId, eventSlug }: AdminLockTreeProps) {
  const [locking, setLocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const lockTree = async () => {
    if (
      !confirm(
        "Chốt cây sẽ khoá layout vĩnh viễn và mở link Xem điều kỳ diệu. Tiếp tục?"
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
      setMessage(`Đã chốt cây v${data.version} — ${data.totalLeaves} lá 🌸`);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLocking(false);
    }
  };

  return (
    <motion.section
      className="rounded-card border border-sprout/30 bg-sprout/5 p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="font-display text-lg font-bold text-foreground">
        Chốt cây
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Sau khi chốt, sinh viên không nộp thêm được và nút{" "}
        <strong>Xem điều kỳ diệu</strong> hiện trên trang chủ.
      </p>

      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-sprout"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap gap-3">
        <AnimatedButton
          onClick={lockTree}
          disabled={locking}
          variant="sprout"
          className="disabled:opacity-50"
        >
          {locking ? "Đang chốt…" : "🌸 Chốt cây ngay"}
        </AnimatedButton>
        <Link
          href={`/v/${eventSlug}?present=1`}
          target="_blank"
          className="inline-flex items-center rounded-button border border-peach/30 px-4 py-2 text-sm font-semibold"
        >
          Xem trước cây
        </Link>
      </div>
    </motion.section>
  );
}
