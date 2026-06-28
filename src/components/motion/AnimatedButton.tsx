"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "sprout";

const variants: Record<Variant, string> = {
  primary:
    "rounded-button bg-peach px-8 py-4 text-lg font-bold text-white shadow-sticker",
  secondary:
    "rounded-button border-2 border-peach/40 bg-surface/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm",
  ghost: "text-sm text-ink-muted underline",
  sprout:
    "rounded-button bg-sprout px-8 py-4 text-lg font-bold text-white shadow-sticker",
};

type AnimatedButtonProps = {
  href?: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

export function AnimatedButton({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  onClick,
}: AnimatedButtonProps) {
  const base = variants[variant];

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Link href={href} className={`inline-block ${base} ${className}`}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${className}`}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}
