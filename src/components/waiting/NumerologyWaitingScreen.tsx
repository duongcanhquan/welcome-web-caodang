"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MagicalSkyBackground } from "@/components/motion/MagicalSkyBackground";
import {
  NUMEROLOGY_WAITING_QUOTES,
  NUMEROLOGY_WAITING_STEPS,
} from "@/lib/numerology/waiting-quotes";

interface NumerologyWaitingScreenProps {
  name?: string;
  /** Thời gian tối thiểu hiển thị (ms) */
  minDurationMs?: number;
  onComplete: () => void;
}

export function NumerologyWaitingScreen({
  name,
  minDurationMs = 4500,
  onComplete,
}: NumerologyWaitingScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / minDurationMs) * 100));
    }, 80);

    const quoteTimer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % NUMEROLOGY_WAITING_QUOTES.length);
    }, 2800);

    const stepTimer = setInterval(() => {
      setStepIndex((i) =>
        i < NUMEROLOGY_WAITING_STEPS.length - 1 ? i + 1 : i
      );
    }, minDurationMs / NUMEROLOGY_WAITING_STEPS.length);

    const doneTimer = setTimeout(() => {
      clearInterval(progressTimer);
      clearInterval(quoteTimer);
      clearInterval(stepTimer);
      onComplete();
    }, minDurationMs);

    return () => {
      clearInterval(progressTimer);
      clearInterval(quoteTimer);
      clearInterval(stepTimer);
      clearTimeout(doneTimer);
    };
  }, [minDurationMs, onComplete]);

  const quote = NUMEROLOGY_WAITING_QUOTES[quoteIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6">
      <MagicalSkyBackground variant="twilight" className="absolute inset-0" />

      {/* Cosmic rings */}
      <motion.div
        className="absolute h-[min(90vw,420px)] w-[min(90vw,420px)] rounded-full border border-honey/20"
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity },
        }}
      />
      <motion.div
        className="absolute h-[min(70vw,320px)] w-[min(70vw,320px)] rounded-full border border-peach/25"
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 max-w-md text-center">
        <motion.p
          className="font-display text-sm font-bold uppercase tracking-[0.3em] text-honey/90"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Thần số học
        </motion.p>

        {name && (
          <motion.h1
            className="font-display mt-3 text-3xl font-bold text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {name}
          </motion.h1>
        )}

        <motion.div
          className="mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-peach via-sun to-honey shadow-[0_0_60px_rgb(255_209_92_/_45%)]"
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 40px rgba(255,209,92,0.3)",
              "0 0 80px rgba(255,111,165,0.5)",
              "0 0 40px rgba(255,209,92,0.3)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <motion.span
            className="font-display text-5xl font-black text-white"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            ✦
          </motion.span>
        </motion.div>

        <p className="mt-6 text-sm font-medium text-white/70">
          {NUMEROLOGY_WAITING_STEPS[stepIndex]}
        </p>

        <div className="mx-auto mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-peach via-honey to-sprout"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.blockquote
            key={quoteIndex}
            className="mt-10 min-h-[5rem]"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg font-medium italic leading-relaxed text-white/95">
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="mt-3 text-xs font-semibold uppercase tracking-wider text-honey/80">
              — {quote.author}
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
    </div>
  );
}
