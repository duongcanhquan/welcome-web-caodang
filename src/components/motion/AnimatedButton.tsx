"use client";

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

/** Nút phản hồi nhanh — CSS active thay vì spring motion (mobile đông người) */
export function AnimatedButton({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  onClick,
}: AnimatedButtonProps) {
  const base = `${variants[variant]} transition-transform duration-75 active:scale-[0.98]`;

  if (href) {
    return (
      <Link href={href} className={`inline-block ${base} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${className}`}
    >
      {children}
    </button>
  );
}
