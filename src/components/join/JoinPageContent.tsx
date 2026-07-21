"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { JoinForm } from "@/components/join/JoinForm";
import { EventCohortBadge } from "@/components/events/EventCohortBadge";
import { PromptPanel } from "@/components/home/PromptPanel";
import {
  AnimatedButton,
  FadeIn,
  MagicalSkyBackground,
  Stagger,
  StaggerItem,
  TiltCard,
} from "@/components/motion";

const RAINBOW = ["#FF6FA5", "#FFAE3B", "#FFD15C", "#3DBE8B", "#5B8DEF", "#FF6B5A"];

function RainbowText({ text }: { text: string }) {
  return (
    <span className="mt-1 block" aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          style={{ color: RAINBOW[i % RAINBOW.length] }}
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

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
    <>
      <div className="relative flex min-h-dvh flex-col overflow-hidden">
        <MagicalSkyBackground
          variant="home"
          parallax
          className="fixed inset-0 -z-10"
        />

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
        >
          {[
            { x: "8%", y: "18%", color: "var(--peach)", size: 110 },
            { x: "78%", y: "28%", color: "var(--sun)", size: 88 },
            { x: "55%", y: "72%", color: "var(--sprout)", size: 96 },
          ].map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                background: `color-mix(in srgb, ${orb.color} 35%, transparent)`,
              }}
              animate={{
                x: [0, 18, -12, 0],
                y: [0, -20, 12, 0],
                scale: [1, 1.12, 0.96, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <header className="relative z-10 flex justify-center px-5 pt-7 pb-2 sm:pt-8">
          <motion.div
            initial={{ opacity: 0, y: -24, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
          >
            <Link href="/" aria-label="Về trang chủ">
              <Image
                src="/branding/logo-vietmy.png"
                alt="Cao đẳng Việt Mỹ — Hà Nội"
                width={280}
                height={118}
                priority
                className="h-auto w-[min(260px,72vw)] object-contain drop-shadow-[0_8px_32px_rgb(255_255_255_/_50%)]"
              />
            </Link>
          </motion.div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 lg:flex-row lg:items-start lg:gap-10 lg:px-8 lg:pb-14">
          {/* Cột brand — cùng ngôn ngữ trang chủ */}
          <Stagger className="shrink-0 text-center lg:sticky lg:top-8 lg:w-[min(420px,42%)] lg:pt-4 lg:text-left">
            <StaggerItem>
              <motion.span
                className="inline-block rounded-full border border-white/40 bg-white/25 px-4 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-brand-navy shadow-lg backdrop-blur-md"
                animate={{
                  boxShadow: [
                    "0 4px 16px rgb(255 255 255 / 30%)",
                    "0 6px 28px rgb(255 209 92 / 35%)",
                    "0 4px 16px rgb(255 255 255 / 30%)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Orientation · Việt Mỹ College
              </motion.span>
            </StaggerItem>

            {(batchLabel || classLabel || eventName) && (
              <StaggerItem>
                <div className="mt-3 flex justify-center lg:justify-start">
                  <EventCohortBadge
                    batchLabel={batchLabel}
                    classLabel={classLabel}
                    name={eventName}
                    slug={eventSlug}
                    size="sm"
                  />
                </div>
              </StaggerItem>
            )}

            <StaggerItem>
              <h1 className="font-display mt-4 text-4xl font-bold leading-[1.05] text-white drop-shadow-[0_4px_24px_rgb(13_61_107_/_50%)] sm:text-5xl lg:text-6xl">
                WELCOME
                <RainbowText text="NEW LYONS" />
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mx-auto mt-4 max-w-md text-sm font-medium text-white/90 drop-shadow-sm sm:text-base lg:mx-0">
                Gửi ảnh của bạn — nhận bất ngờ & thần số học ngay
              </p>
            </StaggerItem>

            {!isLocked && (
              <StaggerItem>
                <div className="mt-6 hidden lg:block">
                  <div className="relative mx-auto w-fit lg:mx-0">
                    <motion.div
                      className="absolute -inset-6 -z-10 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,209,92,0.35) 0%, rgba(255,111,165,0.12) 50%, transparent 70%)",
                      }}
                      animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <TiltCard className="border-white/30 bg-white/10 p-2 shadow-[0_20px_60px_rgb(13_61_107_/_22%)] backdrop-blur-sm">
                      <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{
                          duration: 4.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Image
                          src="/branding/mascot-lyon.png"
                          alt="Lyon — linh vật Cao đẳng Việt Mỹ"
                          width={320}
                          height={400}
                          className="h-auto w-[220px] object-contain"
                        />
                      </motion.div>
                    </TiltCard>
                  </div>
                </div>
              </StaggerItem>
            )}
          </Stagger>

          {/* Cột form */}
          <div className="mx-auto w-full max-w-lg flex-1 lg:mx-0 lg:max-w-xl lg:pt-2">
            {isLocked ? (
              <FadeIn>
                <div className="rounded-[1.5rem] border border-white/40 bg-white/88 px-6 py-10 text-center shadow-[0_20px_60px_rgb(13_61_107_/_18%)] backdrop-blur-xl">
                  <p className="font-display text-xl font-bold text-coral">
                    Đợt này đã chốt cây
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    «{eventName}» không nhận thêm ảnh mới.
                  </p>
                  <Link
                    href={`/v/${eventSlug}`}
                    className="mt-6 inline-block rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
                  >
                    Xem điều kỳ diệu
                  </Link>
                </div>
              </FadeIn>
            ) : (
              <FadeIn delay={0.1} className="space-y-4">
                <div className="rounded-2xl border border-white/45 bg-white/20 p-4 shadow-lg backdrop-blur-md sm:p-5">
                  <p className="text-center text-sm font-semibold text-white drop-shadow lg:text-left">
                    Chưa có ảnh đẹp? Tạo bằng AI trước khi gửi
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <AnimatedButton
                      type="button"
                      variant="secondary"
                      className="border-2 border-white/90 bg-white px-5 py-3 text-sm font-bold text-brand-navy shadow-md sm:shrink-0"
                      onClick={() => setPromptOpen(true)}
                    >
                      Prompt tạo ảnh
                    </AnimatedButton>
                    <p className="text-center text-xs leading-relaxed text-white/85 sm:text-left">
                      Chọn ngành → copy prompt → dán ChatGPT / Gemini → lưu ảnh → gửi form
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/50 bg-white/90 p-5 shadow-[0_24px_70px_rgb(13_61_107_/_20%)] backdrop-blur-xl sm:p-6">
                  <JoinForm
                    majors={majors}
                    eventSlug={eventSlug}
                    maxFileMb={maxFileMb}
                    onOpenPrompt={() => setPromptOpen(true)}
                  />
                </div>

                {/* Mascot nhỏ trên mobile — không chiếm hero form */}
                <div className="flex justify-center pt-2 lg:hidden">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src="/branding/mascot-lyon.png"
                      alt=""
                      width={140}
                      height={170}
                      className="h-auto w-[100px] object-contain opacity-95 drop-shadow-lg"
                    />
                  </motion.div>
                </div>
              </FadeIn>
            )}
          </div>
        </main>

        <footer className="relative z-10 border-t border-white/20 bg-white/15 px-6 py-3.5 text-center text-xs text-white/80 backdrop-blur-md">
          <Link href="/" className="underline-offset-2 hover:underline">
            ← Trang chủ
          </Link>
          <span className="mx-2 opacity-50">·</span>
          Thành viên Tập đoàn Giáo dục EQuest · Cao đẳng Việt Mỹ Hà Nội
        </footer>
      </div>

      <PromptPanel open={promptOpen} onClose={() => setPromptOpen(false)} />
    </>
  );
}
