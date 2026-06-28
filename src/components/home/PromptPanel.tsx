"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IMAGE_PROMPT_STYLES,
  PROMPT_MAJORS,
  type PromptStyleId,
} from "@/lib/prompts/image-prompts";
import { AnimatedButton } from "@/components/motion";

interface PromptPanelProps {
  open: boolean;
  onClose: () => void;
}

export function PromptPanel({ open, onClose }: PromptPanelProps) {
  const [major, setMajor] = useState<string>(PROMPT_MAJORS[0]);
  const [copiedId, setCopiedId] = useState<PromptStyleId | null>(null);

  const copyPrompt = useCallback(async (id: PromptStyleId, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Đóng"
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="prompt-panel-title"
            className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-50 mx-auto max-h-[85vh] max-w-lg overflow-y-auto rounded-[var(--radius-card)] border border-brand-navy/10 bg-surface p-6 shadow-soft sm:inset-x-auto sm:right-6 sm:left-auto sm:top-6 sm:w-full"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="prompt-panel-title"
                  className="font-display text-xl font-bold text-brand-navy"
                >
                  Prompt tạo ảnh
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Chọn ngành → Copy prompt → Dán vào ChatGPT / Gemini kèm ảnh của bạn
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-ink-muted hover:bg-surface-warm"
                aria-label="Đóng panel"
              >
                ✕
              </button>
            </div>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
                Ngành nghề tương lai
              </span>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-xl border-2 border-brand-navy/15 bg-surface-warm px-4 py-3 text-foreground focus:border-brand-navy focus:outline-none"
              >
                {PROMPT_MAJORS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-4">
              {IMAGE_PROMPT_STYLES.map((style) => {
                const prompt = style.buildPrompt(major);
                const copied = copiedId === style.id;
                return (
                  <div
                    key={style.id}
                    className="rounded-xl border border-brand-navy/10 bg-surface-warm/80 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xl" aria-hidden>
                        {style.emoji}
                      </span>
                      <div>
                        <p className="font-display font-bold text-brand-navy">
                          {style.label}
                        </p>
                        <p className="text-xs text-ink-muted">{style.description}</p>
                      </div>
                    </div>
                    <p className="mb-3 max-h-28 overflow-y-auto rounded-lg bg-white/70 p-3 text-xs leading-relaxed text-ink-muted">
                      {prompt}
                    </p>
                    <AnimatedButton
                      type="button"
                      variant={copied ? "sprout" : "secondary"}
                      className="w-full py-2.5 text-sm"
                      onClick={() => copyPrompt(style.id, prompt)}
                    >
                      {copied ? "Đã copy ✓" : "Copy prompt"}
                    </AnimatedButton>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-ink-muted">
              Mẹo: Upload ảnh chân dung rõ mặt → dán prompt → tải ảnh kết quả về máy
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
