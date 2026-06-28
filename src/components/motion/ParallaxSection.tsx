"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

interface ParallaxSectionProps {
  children: ReactNode;
  background?: ReactNode;
  className?: string;
  bgOffset?: string;
  contentOffset?: string;
}

export function ParallaxSection({
  children,
  background,
  className,
  bgOffset = "30%",
  contentOffset = "50%",
}: ParallaxSectionProps) {
  const ref = useRef(null);
  const prefersReduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", bgOffset]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", contentOffset]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  if (prefersReduced) {
    return (
      <section ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
        {background}
        <div className="relative z-10">{children}</div>
      </section>
    );
  }

  return (
    <section ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {background && (
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          {background}
        </motion.div>
      )}
      <motion.div className="relative z-10" style={{ y: textY, opacity }}>
        {children}
      </motion.div>
    </section>
  );
}
