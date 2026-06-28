"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { useRef } from "react";
import { useInView } from "motion/react";
import { scrollReveal, viewportMargin } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  margin?: string;
}

export function ScrollReveal({
  children,
  margin = viewportMargin.standard,
  className,
  ...props
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: margin as `${number}px` });
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={scrollReveal}
      initial="hidden"
      animate={prefersReduced || isInView ? "visible" : "hidden"}
      {...props}
    >
      {children}
    </motion.div>
  );
}
