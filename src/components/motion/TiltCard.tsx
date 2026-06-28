"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
  const prefersReduced = usePrefersReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  if (prefersReduced) {
    return (
      <div
        className={`rounded-[var(--radius-card)] border border-peach/20 bg-surface/80 p-6 shadow-soft ${className ?? ""}`}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        willChange: "transform",
      }}
      className={`rounded-[var(--radius-card)] border border-peach/20 bg-surface/80 p-6 shadow-soft backdrop-blur-sm ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}
