"use client";

import { useState } from "react";
import { JoinForm } from "@/components/join/JoinForm";
import { EventCohortBadge } from "@/components/events/EventCohortBadge";
import { PromptPanel } from "@/components/home/PromptPanel";
import { FadeIn, GradientText, Stagger, StaggerItem, AnimatedButton } from "@/components/motion";
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
  const [promptOpen, setPromptOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <Stagger className="mb-6 w-full max-w-md text-center">
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

      {!isLocked && (
        <FadeIn className="mb-6 w-full max-w-md">
          <div className="rounded-2xl border border-brand-navy/15 bg-surface/95 p-4 text-left shadow-soft">
            <p className="font-display text-base font-bold text-brand-navy">
              Bạn vừa quét QR? Làm theo 3 bước
            </p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink-muted">
              <li>
                <strong className="text-foreground">Tạo ảnh đẹp</strong> bằng
                prompt (ChatGPT / Gemini) — hoặc dùng ảnh có sẵn
              </li>
              <li>
                Quay lại đây → <strong className="text-foreground">chọn ảnh</strong>
                , điền tên / ngày sinh / ngành
              </li>
              <li>
                Bấm <strong className="text-foreground">Gửi ảnh</strong> để nhận
                thần số học
              </li>
            </ol>
            <AnimatedButton
              type="button"
              variant="secondary"
              className="mt-4 w-full border-2 border-brand-navy/20 py-3 text-sm font-bold text-brand-navy"
              onClick={() => setPromptOpen(true)}
            >
              🎨 Mở hướng dẫn Prompt tạo ảnh
            </AnimatedButton>
            <p className="mt-2 text-center text-xs text-ink-muted">
              Giống trang chủ — chọn ngành → copy prompt → dán vào AI kèm ảnh của
              bạn
            </p>
          </div>
        </FadeIn>
      )}

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
        <FadeIn delay={0.15}>
          <JoinForm
            majors={majors}
            eventSlug={eventSlug}
            maxFileMb={maxFileMb}
            onOpenPrompt={() => setPromptOpen(true)}
          />
        </FadeIn>
      )}

      <PromptPanel open={promptOpen} onClose={() => setPromptOpen(false)} />
    </div>
  );
}
