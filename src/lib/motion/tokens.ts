/** Scroll-driven transition presets */
export const scrollTransition = {
  reveal: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  cinematic: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  pop: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

/** IntersectionObserver margin presets for useInView */
export const viewportMargin = {
  early: "-100px",
  standard: "-80px",
  late: "-20px",
} as const;
