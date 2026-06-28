"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeInUp, staggerContainer, springSoft } from "./presets";

interface StaggerProps extends HTMLMotionProps<"div"> {
  fast?: boolean;
}

export function Stagger({ children, fast, ...props }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeInUp} transition={springSoft} {...props}>
      {children}
    </motion.div>
  );
}
