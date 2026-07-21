"use client";

import { useEffect, useId, useState } from "react";
import type { LifePathContent } from "@/lib/numerology";
import type { NumerologyResult } from "@/lib/numerology";
import { motion, AnimatePresence } from "motion/react";
import { Stagger, StaggerItem } from "@/components/motion";

const PREVIEW_CHARS = 320;

interface NumerologyCardProps {
  name: string;
  major: string;
  numerology: NumerologyResult;
  content: LifePathContent;
  aiText?: string | null;
  wishComment?: string;
  funFact?: string;
  majorMatch?: string;
  reveal?: boolean;
  /** Đang chờ AI viết bài dài */
  writingFull?: boolean;
}

export function NumerologyCard({
  name,
  major,
  numerology,
  content,
  aiText,
  wishComment,
  funFact,
  majorMatch,
  reveal = false,
  writingFull = false,
}: NumerologyCardProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const fullText = (aiText?.trim() || content.description).trim();
  const isLong = fullText.length > PREVIEW_CHARS;
  const preview = isLong
    ? `${fullText.slice(0, PREVIEW_CHARS).trim()}…`
    : fullText;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <motion.div
        className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/20 shadow-[0_24px_80px_rgb(13_61_107_/_35%)]"
        initial={reveal ? { opacity: 0, scale: 0.85, rotateX: 8 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, duration: 0.9 }}
        style={{ perspective: 1000 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #0f2847 0%, #1a4a7a 40%, #2d1b4e 100%)",
          }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,209,92,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(255,111,165,0.2) 0%, transparent 40%)",
          }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="relative border-b border-white/10 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey/90">
            Cho vui & tham khảo ✨
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold text-white">{name}</h2>
          <p className="mt-1 text-sm text-white/70">{major}</p>
        </div>

        <Stagger className="relative space-y-6 p-6">
          <StaggerItem>
            <div className="relative py-4 text-center">
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="h-32 w-32 rounded-full bg-honey/20 blur-2xl" />
              </motion.div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                Số Đường Đời
              </p>
              <motion.p
                className="font-display relative mt-2 text-8xl font-black"
                style={{
                  background: "linear-gradient(180deg, #FFD15C 0%, #FF6FA5 50%, #fff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(255,209,92,0.5))",
                }}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
              >
                {numerology.lifePath}
              </motion.p>
              <p className="mt-3 text-lg font-semibold text-honey">{content.keywords}</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Bản đánh giá thần số
                </p>
                <span className="text-[11px] text-white/40">
                  {fullText.length.toLocaleString("vi-VN")} ký tự
                </span>
              </div>
              <p className="whitespace-pre-line text-left text-sm leading-relaxed text-white/85 sm:text-[15px]">
                {preview}
              </p>
              {writingFull && (
                <p className="mt-3 animate-pulse text-xs font-semibold text-honey">
                  ✨ Đang viết bài đầy đủ (≥1000 chữ) — chờ thêm chút…
                </p>
              )}
              {(isLong || writingFull) && (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="mt-4 w-full rounded-full border border-honey/40 bg-honey/15 px-4 py-2.5 text-sm font-bold text-honey transition hover:bg-honey/25"
                >
                  {isLong ? "Đọc toàn bộ bài đánh giá →" : "Xem bản đang soạn →"}
                </button>
              )}
            </div>
          </StaggerItem>

          {majorMatch && (
            <StaggerItem>
              <motion.p
                className="rounded-xl border border-sprout/30 bg-sprout/15 px-4 py-3 text-sm text-white/90 backdrop-blur-sm"
                whileHover={{ scale: 1.01 }}
              >
                🎯 {majorMatch}
              </motion.p>
            </StaggerItem>
          )}

          <StaggerItem>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Ngày sinh" value={numerology.birthDay} />
              <StatBox label="Năm 2026" value={numerology.personalYear} accent="coral" />
            </div>
          </StaggerItem>

          <StaggerItem>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
                Định hướng nghề
              </p>
              <div className="flex flex-wrap gap-2">
                {content.careers.map((c, i) => (
                  <motion.span
                    key={c}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <motion.p
              className="rounded-xl border border-honey/25 bg-honey/10 px-4 py-3 text-sm text-white/90"
              animate={{
                borderColor: [
                  "rgba(255, 209, 92, 0.25)",
                  "rgba(255, 174, 59, 0.45)",
                  "rgba(255, 209, 92, 0.25)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              💡 {content.freshmanAdvice}
            </motion.p>
          </StaggerItem>

          {wishComment && (
            <StaggerItem>
              <p className="text-sm italic text-peach/90">🌟 {wishComment}</p>
            </StaggerItem>
          )}
          {funFact && (
            <StaggerItem>
              <p className="text-sm text-white/70">🍀 {funFact}</p>
            </StaggerItem>
          )}
        </Stagger>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Đóng"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0f2847] shadow-2xl sm:rounded-3xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <p id={titleId} className="font-display text-lg font-bold text-white">
                    Bản đánh giá thần số học
                  </p>
                  <p className="mt-0.5 text-sm text-white/60">
                    {name} · Số {numerology.lifePath} · {fullText.length.toLocaleString("vi-VN")} ký tự
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Đóng
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="whitespace-pre-line text-[15px] leading-7 text-white/90">
                  {fullText}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatBox({
  label,
  value,
  accent = "honey",
}: {
  label: string;
  value: number;
  accent?: "honey" | "coral";
}) {
  const color = accent === "coral" ? "text-coral" : "text-honey";
  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
      whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.08)" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
        {label}
      </p>
      <p className={`font-display text-4xl font-black ${color}`}>{value}</p>
    </motion.div>
  );
}
