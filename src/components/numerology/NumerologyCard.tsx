"use client";

import type { LifePathContent } from "@/lib/numerology";
import type { NumerologyResult } from "@/lib/numerology";
import { motion } from "motion/react";
import { Stagger, StaggerItem } from "@/components/motion";

interface NumerologyCardProps {
  name: string;
  major: string;
  numerology: NumerologyResult;
  content: LifePathContent;
  aiText?: string | null;
  wishComment?: string;
  funFact?: string;
  majorMatch?: string;
}

export function NumerologyCard({
  name,
  major,
  numerology,
  content,
  aiText,
  wishComment,
  funFact,
  majorMatch,
}: NumerologyCardProps) {
  return (
    <motion.div
      className="w-full overflow-hidden rounded-card bg-surface shadow-sticker"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgb(255 111 165 / 22%)" }}
    >
      {/* Header gradient */}
      <motion.div
        className="px-6 py-5 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--peach) 0%, var(--sun) 50%, var(--honey) 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <p className="text-sm font-medium opacity-90">Cho vui & tham khảo ✨</p>
        <h2 className="font-display mt-1 text-2xl font-bold">{name}</h2>
        <p className="text-sm opacity-90">{major}</p>
      </motion.div>

      <Stagger className="space-y-5 p-6">
        {/* Số chính */}
        <StaggerItem>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Số Đường Đời
            </p>
            <motion.p
              className="font-display mt-1 text-7xl font-black text-peach"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
            >
              {numerology.lifePath}
            </motion.p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {content.keywords}
            </p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <p className="text-center text-sm leading-relaxed text-ink-muted">
            {aiText ?? content.description}
          </p>
        </StaggerItem>

        {majorMatch && (
          <StaggerItem>
            <motion.p
              className="rounded-card bg-sprout/10 px-4 py-3 text-sm text-foreground"
              whileHover={{ scale: 1.02 }}
            >
              {majorMatch}
            </motion.p>
          </StaggerItem>
        )}

        {/* Số phụ */}
        <StaggerItem>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Ngày sinh" value={numerology.birthDay} delay={0} />
            <StatBox label="Năm 2026" value={numerology.personalYear} delay={0.1} />
          </div>
        </StaggerItem>

        {/* Nghề định hướng */}
        <StaggerItem>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              Định hướng nghề
            </p>
            <div className="flex flex-wrap gap-2">
              {content.careers.map((c, i) => (
                <motion.span
                  key={c}
                  className="rounded-button bg-surface-warm px-3 py-1 text-xs font-medium text-foreground"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.08, backgroundColor: "var(--honey)" }}
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <motion.p
            className="rounded-card border-2 border-honey/30 bg-honey/10 px-4 py-3 text-sm text-foreground"
            animate={{ borderColor: ["color-mix(in srgb, var(--honey) 30%, transparent)", "color-mix(in srgb, var(--sun) 50%, transparent)", "color-mix(in srgb, var(--honey) 30%, transparent)"] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            💡 {content.freshmanAdvice}
          </motion.p>
        </StaggerItem>

        {wishComment && (
          <StaggerItem>
            <p className="text-sm italic text-ink-muted">🌟 {wishComment}</p>
          </StaggerItem>
        )}
        {funFact && (
          <StaggerItem>
            <p className="text-sm text-ink-muted">🍀 {funFact}</p>
          </StaggerItem>
        )}
      </Stagger>
    </motion.div>
  );
}

function StatBox({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <motion.div
      className="rounded-card bg-surface-warm px-4 py-3 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.05 }}
    >
      <p className="text-xs font-semibold uppercase text-ink-muted">{label}</p>
      <p className="font-display text-3xl font-bold text-coral">{value}</p>
    </motion.div>
  );
}
