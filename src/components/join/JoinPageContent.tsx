"use client";

import { JoinForm } from "@/components/join/JoinForm";
import { FadeIn, GradientText, Stagger, StaggerItem } from "@/components/motion";
import { motion } from "motion/react";

interface JoinPageContentProps {
  majors: string[];
  eventSlug: string;
  maxFileMb: number;
  policyUrl: string;
  isLocked: boolean;
}

export function JoinPageContent({
  majors,
  eventSlug,
  maxFileMb,
  policyUrl,
  isLocked,
}: JoinPageContentProps) {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <Stagger className="mb-8 text-center">
        <StaggerItem>
          <motion.p
            className="font-display text-sm font-semibold uppercase tracking-widest text-peach"
            animate={{ letterSpacing: ["0.15em", "0.25em", "0.15em"] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Việt Mỹ College
          </motion.p>
        </StaggerItem>
        <StaggerItem>
          <GradientText as="h1" className="font-display mt-1 text-3xl font-bold">
            Gửi vào cây 🌿
          </GradientText>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-2 text-ink-muted">
            Tải ảnh AI · điền thông tin · trở thành một chiếc lá
          </p>
        </StaggerItem>
      </Stagger>

      {isLocked ? (
        <FadeIn>
          <motion.p
            className="rounded-card bg-coral/10 px-6 py-4 text-center text-coral"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Sự kiện đã chốt cây — không nhận thêm lá mới.
          </motion.p>
        </FadeIn>
      ) : (
        <FadeIn delay={0.3}>
          <JoinForm
            majors={majors}
            eventSlug={eventSlug}
            maxFileMb={maxFileMb}
            policyUrl={policyUrl}
          />
        </FadeIn>
      )}
    </div>
  );
}
