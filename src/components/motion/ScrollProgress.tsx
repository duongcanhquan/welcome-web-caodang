"use client";

import { motion, useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) return null;

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 h-0.5 origin-left bg-gradient-to-r from-peach via-sun to-sprout ${className ?? ""}`}
      style={{ scaleX: scrollYProgress }}
    />
  );
}
