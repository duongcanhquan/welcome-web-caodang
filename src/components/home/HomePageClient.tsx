"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  AnimatedButton,
  FadeIn,
  GradientText,
  Stagger,
  StaggerItem,
} from "@/components/motion";

export function HomePageClient() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Stagger className="w-full max-w-md text-center">
        <StaggerItem>
          <motion.p
            className="font-display text-sm font-semibold uppercase tracking-widest text-peach"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Việt Mỹ College
          </motion.p>
        </StaggerItem>

        <StaggerItem>
          <GradientText as="h1" className="font-display mt-2 text-4xl font-bold leading-tight sm:text-5xl">
            Cây Khóa 2026
          </GradientText>
        </StaggerItem>

        <StaggerItem>
          <p className="mt-4 text-lg text-ink-muted">
            Mỗi sinh viên là một chiếc lá — cùng nhau làm trường nở rộ 🌿
          </p>
        </StaggerItem>

        <StaggerItem>
          <motion.div
            className="mx-auto mt-6 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {["🌸", "🍃", "✨", "🌿"].map((emoji, i) => (
              <motion.span
                key={emoji}
                className="text-2xl"
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        </StaggerItem>

        <StaggerItem>
          <div className="mt-10 flex flex-col items-center gap-3">
            <AnimatedButton href="/join">Gửi vào cây</AnimatedButton>
            <FadeIn delay={0.6} direction="none">
              <p className="text-sm text-ink-muted">
                Quét QR tại trạm công nghệ để tham gia
              </p>
            </FadeIn>
            <FadeIn delay={0.7} direction="none">
              <div className="mt-2 flex flex-wrap justify-center gap-4">
                {[
                  { href: "/admin/login", label: "Admin" },
                  { href: "/live/k2026", label: "Màn LIVE" },
                  { href: "/v/k2026", label: "Xem cây" },
                ].map((link) => (
                  <motion.div
                    key={link.href}
                    whileHover={{ scale: 1.05, color: "var(--peach)" }}
                  >
                    <Link href={link.href} className="text-sm text-ink-muted underline">
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
