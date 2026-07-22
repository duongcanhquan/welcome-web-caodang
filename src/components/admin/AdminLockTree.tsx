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
  const [isError, setIsError] = useState(false);

  const lockTree = async (forceRebuild = false) => {
    if (
      !confirm(
        forceRebuild
          ? "Tạo lại mosaic cho cây đã chốt? Layout sẽ được tính lại từ bài nộp hiện tại."
          : "Chốt cây sẽ khoá layout vĩnh viễn và mở link Xem điều kỳ diệu. Tiếp tục?"
      )
    ) {
      return;
    }

    setLocking(true);
    setMessage(null);
    setIsError(false);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    try {
      const res = await fetch("/api/admin/lock-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, forceRebuild }),
        signal: controller.signal,
      });
      const data = (await res.json()) as {
        error?: string;
        version?: number;
        totalLeaves?: number;
      };
      if (!res.ok) throw new Error(data.error ?? "Không chốt được");

      confetti({ particleCount: 200, spread: 120 });
      setMessage(
        `Đã chốt cây v${data.version} — ${data.totalLeaves ?? 0} lá 🌸`
      );
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setIsError(true);
      if (err instanceof Error && err.name === "AbortError") {
        setMessage(
          "Chốt cây quá lâu / mất kết nối. Thử lại — nếu đã chốt rồi hãy mở Live hoặc bấm «Tạo lại mosaic»."
        );
      } else {
        setMessage(err instanceof Error ? err.message : "Lỗi");
      }
    } finally {
      clearTimeout(timeout);
      setLocking(false);
    }
  };

  return (
    <motion.section
      className="rounded-card border border-sprout/30 bg-sprout/5 p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="font-display text-xl font-bold text-foreground">
        Chốt cây
      </h2>
      <p className="mt-1 text-base text-ink-muted">
        Sau khi chốt, sinh viên không nộp thêm được và nút{" "}
        <strong>Xem điều kỳ diệu</strong> hiện trên trang chủ. Xem ảnh trên{" "}
        <strong>Live</strong> hoặc <strong>Xem trước</strong> — không cần chờ
        chốt để thấy ảnh đã nộp.
      </p>

      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`mt-3 text-base ${isError ? "text-coral" : "text-sprout"}`}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap gap-3">
        <AnimatedButton
          onClick={() => void lockTree(false)}
          disabled={locking}
          variant="sprout"
          className="disabled:opacity-50"
        >
          {locking ? "Đang chốt…" : "🌸 Chốt cây ngay"}
        </AnimatedButton>
        <button
          type="button"
          disabled={locking}
          onClick={() => void lockTree(true)}
          className="rounded-button border border-peach/30 px-4 py-2 text-base font-semibold disabled:opacity-50"
        >
          Tạo lại mosaic
        </button>
        <Link
          href={`/live/${eventSlug}?present=1`}
          target="_blank"
          className="inline-flex items-center rounded-button border border-peach/30 px-4 py-2 text-base font-semibold"
        >
          Live (ảnh trực tiếp)
        </Link>
        <Link
          href={`/v/${eventSlug}`}
          target="_blank"
          className="inline-flex items-center rounded-button border border-peach/30 px-4 py-2 text-base font-semibold"
        >
          Link SV xem cây
        </Link>
        <Link
          href={`/v/${eventSlug}?present=1`}
          target="_blank"
          className="inline-flex items-center rounded-button border border-peach/30 px-4 py-2 text-base font-semibold"
        >
          Trình chiếu
        </Link>
      </div>
    </motion.section>
  );
}
