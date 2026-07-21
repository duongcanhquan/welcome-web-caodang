"use client";

import { JoinForm } from "@/components/join/JoinForm";
import { EventCohortBadge } from "@/components/events/EventCohortBadge";
import { FadeIn, GradientText, Stagger, StaggerItem } from "@/components/motion";
import { motion } from "motion/react";

interface JoinPageContentProps {
  majors: string[];
  eventSlug: string;
  eventName: string;
  batchLabel?: string;
  classLabel?: string;
  maxFileMb: number;
  isLocked: boolean;
}

export function JoinPageContent({
  majors,
  eventSlug,
  eventName,
  batchLabel,
  classLabel,
  maxFileMb,
  isLocked,
}: JoinPageContentProps) {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <Stagger className="mb-8 text-center">
        <StaggerItem>
          <motion.p
            className="font-display text-sm font-semibold uppercase tracking-widest text-brand-navy/70"
            animate={{ letterSpacing: ["0.15em", "0.25em", "0.15em"] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Việt Mỹ College
          </motion.p>
        </StaggerItem>
        <StaggerItem>
          <div className="mt-3 flex justify-center">
            <EventCohortBadge
              batchLabel={batchLabel}
              classLabel={classLabel}
              name={eventName}
              slug={eventSlug}
            />
          </div>
        </StaggerItem>
        <StaggerItem>
          <GradientText as="h1" className="font-display mt-3 text-3xl font-bold">
            Thần số học của bạn ✨
          </GradientText>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-2 text-ink-muted">
            Gửi ảnh cho <strong className="text-foreground">{eventName}</strong> —
            nhận bất ngờ và xem thần số học ngay
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
            Đợt «{eventName}» đã chốt cây — không nhận thêm lá mới.
          </motion.p>
        </FadeIn>
      ) : (
        <FadeIn delay={0.3}>
          <JoinForm majors={majors} eventSlug={eventSlug} maxFileMb={maxFileMb} />
        </FadeIn>
      )}
    </div>
  );
}
