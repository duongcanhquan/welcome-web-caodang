import type { Variants } from "motion/react";
import { scrollTransition } from "./tokens";

/** Viewport reveal — fade + slide up on scroll entry */
export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: scrollTransition.reveal,
  },
};

/** Stagger child item for scroll reveals */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: scrollTransition.reveal,
  },
};

export const scrollRevealLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: scrollTransition.reveal,
  },
};

export const scrollRevealRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: scrollTransition.reveal,
  },
};

export const scrollRevealScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: scrollTransition.pop,
  },
};

export const scrollRevealBlur: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: scrollTransition.cinematic,
  },
};

export const heroStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: scrollTransition.cinematic,
  },
};

export const hoverLiftGlow: Variants = {
  rest: { y: 0, boxShadow: "0 4px 24px rgb(42 34 48 / 8%)" },
  hover: {
    y: -4,
    boxShadow: "0 8px 32px rgb(255 111 165 / 18%)",
    transition: { duration: 0.2 },
  },
};

export const tapScale = { scale: 0.97 };
export const tapScaleSmall = { scale: 0.98 };

export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: scrollTransition.pop,
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: scrollTransition.pop,
  },
};
