"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";

export interface ScrollEffect {
  at: number;
  id: string;
  action: () => void;
}

export function useScrollEffects(effects: ScrollEffect[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fired, setFired] = useState<Set<string>>(new Set());

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    for (const effect of effects) {
      if (progress >= effect.at && !fired.has(effect.id)) {
        effect.action();
        setFired((prev) => new Set(prev).add(effect.id));
      }
    }
  });

  return containerRef;
}
