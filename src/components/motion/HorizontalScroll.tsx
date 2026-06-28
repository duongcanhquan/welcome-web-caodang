"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  heightVh?: number;
  scrollPercent?: string;
}

export function HorizontalScroll({
  children,
  className,
  heightVh = 300,
  scrollPercent = "-75%",
}: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", scrollPercent]);

  if (prefersReduced) {
    return (
      <section className={`flex gap-8 overflow-x-auto px-8 py-16 ${className ?? ""}`}>
        {children}
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      style={{ height: `${heightVh}vh` }}
      className={`relative ${className ?? ""}`}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div className="flex gap-8 pl-8" style={{ x }}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
