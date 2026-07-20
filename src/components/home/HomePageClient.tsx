"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  AnimatedButton,
  MagicalSkyBackground,
  ScrollReveal,
  Stagger,
  StaggerItem,
  TiltCard,
} from "@/components/motion";
import { PromptPanel } from "./PromptPanel";

const RAINBOW = ["#FF6FA5", "#FFAE3B", "#FFD15C", "#3DBE8B", "#5B8DEF", "#FF6B5A"];

function RainbowText({ text }: { text: string }) {
  return (
    <span className="mt-2 block" aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          style={{ color: RAINBOW[i % RAINBOW.length] }}
          animate={{ y: [0, -4, 0] }}
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

interface HomePageClientProps {
  treeReady?: boolean;
  eventSlug: string;
}

export function HomePageClient({
  treeReady = false,
  eventSlug,
}: HomePageClientProps) {
  const [promptOpen, setPromptOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.85]);
  const mascotScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.92]);

  return (
    <>
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <MagicalSkyBackground variant="home" parallax className="fixed inset-0 -z-10" />

        <div aria-hidden className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
          {[
            { x: "10%", y: "20%", color: "var(--peach)", size: 120 },
            { x: "80%", y: "30%", color: "var(--sun)", size: 90 },
            { x: "60%", y: "70%", color: "var(--sprout)", size: 100 },
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
                x: [0, 20, -15, 0],
                y: [0, -25, 15, 0],
                scale: [1, 1.15, 0.95, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.header
          style={{ opacity: heroOpacity }}
          className="relative z-10 flex justify-center px-6 pt-8 pb-2"
        >
          <motion.div
            initial={{ opacity: 0, y: -24, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
          >
            <Image
              src="/branding/logo-vietmy.png"
              alt="Cao đẳng Việt Mỹ — Hà Nội"
              width={300}
              height={128}
              priority
              className="h-auto w-[min(300px,78vw)] object-contain drop-shadow-[0_8px_32px_rgb(255_255_255_/_50%)]"
            />
          </motion.div>
        </motion.header>

        <motion.main
          style={{ opacity: heroOpacity }}
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-6 px-6 pb-12 lg:flex-row lg:items-center lg:gap-8 lg:pb-16"
        >
          <Stagger className="flex-1 text-center lg:text-left">
            <StaggerItem>
              <motion.span
                className="inline-block rounded-full border border-white/40 bg-white/25 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-navy shadow-lg backdrop-blur-md"
                animate={{
                  boxShadow: [
                    "0 4px 20px rgb(255 255 255 / 30%)",
                    "0 8px 40px rgb(255 209 92 / 40%)",
                    "0 4px 20px rgb(255 255 255 / 30%)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✨ Orientation · Việt Mỹ College
              </motion.span>
            </StaggerItem>

            <StaggerItem>
              <h1 className="font-display mt-5 text-5xl font-bold leading-[1.05] text-white drop-shadow-[0_4px_24px_rgb(13_61_107_/_50%)] sm:text-6xl lg:text-7xl">
                WELCOME
                <RainbowText text="NEW LYONS" />
              </h1>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
                <AnimatedButton
                  href="/join"
                  variant="sprout"
                  className="max-w-full px-6 py-4 text-center text-base leading-snug shadow-sticker ring-2 ring-white/40 sm:text-lg"
                >
                  Gửi ảnh — Nhận Bất ngờ & Xem thần số học
                </AnimatedButton>
                <AnimatedButton
                  type="button"
                  variant="secondary"
                  className="border-2 border-white/80 bg-white px-6 py-3.5 text-base font-bold text-brand-navy shadow-lg"
                  onClick={() => setPromptOpen(true)}
                >
                  Prompt ảnh
                </AnimatedButton>
              </div>
            </StaggerItem>

            {treeReady && (
              <StaggerItem>
                <div className="mt-6 flex flex-wrap justify-center lg:justify-start">
                  <Link
                    href={`/v/${eventSlug}`}
                    className="rounded-full bg-white/25 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-white/40"
                  >
                    ✨ Xem điều kỳ diệu
                  </Link>
                </div>
              </StaggerItem>
            )}
          </Stagger>

          <ScrollReveal className="relative flex flex-1 items-center justify-center lg:justify-end">
            <motion.div style={{ scale: mascotScale }} className="relative">
              <motion.div
                className="absolute -inset-8 -z-10 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,209,92,0.4) 0%, rgba(255,111,165,0.15) 50%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <TiltCard className="border-white/30 bg-white/10 p-2 shadow-[0_24px_80px_rgb(13_61_107_/_25%)] backdrop-blur-sm">
                <motion.div
                  animate={{ y: [0, -16, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src="/branding/mascot-lyon.png"
                    alt="Lyon — linh vật Cao đẳng Việt Mỹ"
                    width={420}
                    height={520}
                    priority
                    className="h-auto w-[min(300px,82vw)] object-contain lg:w-[min(380px,40vw)]"
                  />
                </motion.div>
              </TiltCard>
            </motion.div>
          </ScrollReveal>
        </motion.main>

        <footer className="relative z-10 border-t border-white/20 bg-white/15 px-6 py-4 text-center text-xs text-white/80 backdrop-blur-md">
          Thành viên Tập đoàn Giáo dục EQuest · Cao đẳng Việt Mỹ Hà Nội
        </footer>
      </div>

      <PromptPanel open={promptOpen} onClose={() => setPromptOpen(false)} />
    </>
  );
}
