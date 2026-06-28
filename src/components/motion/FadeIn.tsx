"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeInUp, springSoft } from "./presets";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

const directionMap = {
  up: { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -28 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0 } },
  none: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

export function FadeIn({
  children,
  delay = 0,
  duration,
  direction = "up",
  ...props
}: FadeInProps) {
  const variants = direction === "up" ? fadeInUp : directionMap[direction];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        ...(duration ? { duration } : springSoft),
        delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
