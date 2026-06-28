import type { Transition, Variants } from "motion/react";

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 500, damping: 22 },
  },
};

export const shimmerGradient = {
  backgroundSize: "200% 200%",
  backgroundImage:
    "linear-gradient(135deg, var(--peach) 0%, var(--sun) 35%, var(--honey) 65%, var(--sprout) 100%)",
};
