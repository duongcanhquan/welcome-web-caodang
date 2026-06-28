"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

export interface ScrollStep {
  id: string;
  heading: string;
  body: string;
  visual: ReactNode;
}

interface ScrollSequenceProps {
  steps: ScrollStep[];
  className?: string;
}

function ScrollStepText({
  index,
  step,
  progress,
  totalSteps,
}: {
  index: number;
  step: ScrollStep;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  totalSteps: number;
}) {
  const segmentSize = 1 / totalSteps;
  const start = index * segmentSize;
  const end = start + segmentSize;

  const opacity = useTransform(
    progress,
    [start, start + segmentSize * 0.2, end - segmentSize * 0.2, end],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [start, start + segmentSize * 0.2, end - segmentSize * 0.2, end],
    [30, 0, 0, -30],
  );

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center"
      style={{ opacity, y }}
    >
      <h3 className="font-display text-2xl font-bold text-foreground md:text-3xl">
        {step.heading}
      </h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
        {step.body}
      </p>
      <div className="mt-8 flex gap-2">
        {Array.from({ length: totalSteps }).map((_, j) => (
          <motion.div
            key={j}
            className="h-1 rounded-full"
            style={{
              width: j === index ? 32 : 12,
              backgroundColor:
                j === index ? "var(--peach)" : "rgb(42 34 48 / 15%)",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ScrollStepVisual({
  index,
  visual,
  progress,
  totalSteps,
}: {
  index: number;
  visual: ReactNode;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  totalSteps: number;
}) {
  const segmentSize = 1 / totalSteps;
  const start = index * segmentSize;
  const end = start + segmentSize;

  const opacity = useTransform(
    progress,
    [start, start + segmentSize * 0.15, end - segmentSize * 0.15, end],
    [0, 1, 1, 0],
  );
  const scale = useTransform(
    progress,
    [start, start + segmentSize * 0.15, end - segmentSize * 0.15, end],
    [0.95, 1, 1, 0.95],
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, scale }}
    >
      {visual}
    </motion.div>
  );
}

export function ScrollSequence({ steps, className }: ScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (prefersReduced) {
    return (
      <section className={`space-y-16 px-4 py-16 ${className ?? ""}`}>
        {steps.map((step) => (
          <div key={step.id} className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-2xl font-bold">{step.heading}</h3>
              <p className="mt-4 text-ink-muted">{step.body}</p>
            </div>
            <div>{step.visual}</div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      style={{ height: `${steps.length * 100}vh` }}
      className={`relative ${className ?? ""}`}
    >
      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
          <div className="relative min-h-[200px]">
            {steps.map((step, i) => (
              <ScrollStepText
                key={step.id}
                index={i}
                step={step}
                progress={scrollYProgress}
                totalSteps={steps.length}
              />
            ))}
          </div>
          <div className="relative flex h-[60vh] items-center justify-center">
            {steps.map((step, i) => (
              <ScrollStepVisual
                key={step.id}
                index={i}
                visual={step.visual}
                progress={scrollYProgress}
                totalSteps={steps.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
