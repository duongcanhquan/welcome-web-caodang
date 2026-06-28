"use client";

import { motion } from "motion/react";

const ORBS = [
  { color: "var(--peach)", size: "min(70vw, 420px)", x: "-15%", y: "-10%", delay: 0 },
  { color: "var(--sun)", size: "min(55vw, 320px)", x: "75%", y: "5%", delay: 0.4 },
  { color: "var(--sprout)", size: "min(50vw, 280px)", x: "60%", y: "70%", delay: 0.8 },
  { color: "var(--honey)", size: "min(40vw, 220px)", x: "5%", y: "75%", delay: 1.2 },
  { color: "var(--coral)", size: "min(35vw, 180px)", x: "40%", y: "40%", delay: 0.6 },
];

export function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-background" />

      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--peach) 25%, transparent), transparent 70%)",
        }}
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, color-mix(in srgb, ${orb.color} 45%, transparent) 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 20, -15, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/3 opacity-20"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--sprout) 30%, transparent), transparent)",
        }}
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
