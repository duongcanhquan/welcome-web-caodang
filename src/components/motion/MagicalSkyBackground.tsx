"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

type SkyVariant = "home" | "tree" | "twilight";

interface MagicalSkyBackgroundProps {
  variant?: SkyVariant;
  className?: string;
  /** Parallax theo scroll (trang chủ) */
  parallax?: boolean;
}

const SKY_GRADIENTS: Record<SkyVariant, string> = {
  home: "linear-gradient(180deg, #1a4a7a 0%, #3d8fd4 22%, #87ceeb 45%, #b8e4f9 62%, #e8f5e9 78%, #c8e6c9 100%)",
  tree: "linear-gradient(180deg, #0f2847 0%, #1e5a8a 18%, #4a9fd4 38%, #a8d8f0 55%, #d4ecd8 72%, #7cb87c 88%, #4a7c4e 100%)",
  twilight:
    "linear-gradient(180deg, #0a1628 0%, #1a3a5c 30%, #4a6fa5 55%, #2d4a3e 85%, #1a3020 100%)",
};

const CLOUDS = [
  { top: "8%", left: "-10%", w: "min(55vw, 420px)", h: "80px", opacity: 0.55, duration: 38, delay: 0 },
  { top: "18%", left: "40%", w: "min(45vw, 360px)", h: "64px", opacity: 0.45, duration: 52, delay: 4 },
  { top: "12%", left: "70%", w: "min(40vw, 300px)", h: "56px", opacity: 0.4, duration: 44, delay: 2 },
  { top: "28%", left: "15%", w: "min(50vw, 380px)", h: "72px", opacity: 0.35, duration: 60, delay: 8 },
];

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 95}%`,
  delay: (i * 0.7) % 12,
  duration: 14 + (i % 5) * 3,
  size: 6 + (i % 4) * 3,
  emoji: ["🍃", "✨", "🌸", "💫"][i % 4],
}));

export function MagicalSkyBackground({
  variant = "home",
  className = "",
  parallax = false,
}: MagicalSkyBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const cloudY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 13.7) % 100}%`,
        top: `${(i * 9.3 + 10) % 70}%`,
        delay: (i * 0.35) % 4,
        size: 2 + (i % 3),
      })),
    []
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: SKY_GRADIENTS[variant],
          ...(parallax && !prefersReduced ? { y: skyY } : {}),
        }}
      />

      {/* Aurora shimmer */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-x-0 top-[15%] h-[35%] opacity-30 mix-blend-screen"
          style={{
            background:
              "linear-gradient(105deg, transparent 20%, rgba(255,111,165,0.25) 40%, rgba(61,190,139,0.2) 55%, rgba(255,209,92,0.2) 70%, transparent 90%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Sun glow */}
      <motion.div
        className="absolute -right-[10%] top-[8%] h-[min(45vw,280px)] w-[min(45vw,280px)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,209,92,0.55) 0%, rgba(255,174,59,0.2) 40%, transparent 70%)",
        }}
        animate={
          prefersReduced
            ? {}
            : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cloud layers */}
      {!prefersReduced &&
        CLOUDS.map((c, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              top: c.top,
              width: c.w,
              height: c.h,
              opacity: c.opacity,
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
              ...(parallax && !prefersReduced ? { y: cloudY } : {}),
            }}
            animate={{
              x: ["-5%", "8%", "-5%"],
            }}
            transition={{
              duration: c.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: c.delay,
            }}
          />
        ))}

      {/* Sparkles */}
      {!prefersReduced &&
        sparkles.map((s) => (
          <motion.span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              boxShadow: "0 0 6px 2px rgba(255,255,255,0.8)",
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 2 + (s.id % 3),
              repeat: Infinity,
              delay: s.delay,
            }}
          />
        ))}

      {/* Wind petals / leaves */}
      {!prefersReduced &&
        PETALS.map((p) => (
          <motion.span
            key={p.id}
            className="absolute select-none opacity-60"
            style={{ left: p.left, top: "-5%", fontSize: p.size }}
            animate={{
              y: ["0vh", "110vh"],
              x: [0, 30, -20, 40, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          >
            {p.emoji}
          </motion.span>
        ))}

      {/* 3D rolling hills (tree / home) */}
      {(variant === "tree" || variant === "home") && (
        <>
          <div
            className="absolute bottom-0 left-[-20%] right-[-20%] h-[28%]"
            style={{
              background:
                "radial-gradient(ellipse 90% 100% at 50% 100%, #5a9e5a 0%, #3d7a45 45%, #2d5c35 100%)",
              transform: "perspective(600px) rotateX(12deg)",
              transformOrigin: "bottom center",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[18%] opacity-40"
            style={{
              background:
                "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)",
            }}
            animate={prefersReduced ? {} : { x: [0, -80] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(13,61,107,0.15) 100%)",
        }}
      />
    </div>
  );
}
