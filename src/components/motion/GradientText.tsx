"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
}

export function GradientText({
  children,
  className = "",
  as: Tag = "span",
}: GradientTextProps) {
  const Component = motion[Tag];

  return (
    <Component
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(135deg, var(--peach) 0%, var(--sun) 40%, var(--coral) 70%, var(--sprout) 100%)",
        backgroundSize: "200% auto",
      }}
      animate={{ backgroundPosition: ["0% center", "200% center", "0% center"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </Component>
  );
}
