"use client";

import { motion } from "motion/react";

interface TreeTrunkArtProps {
  width: number;
  height: number;
  trunk: { x: number; y: number; w: number; h: number; color: string };
  presentation?: boolean;
}

/** Thân cây SVG — vỏ cây thật, nhánh, nối tán */
export function TreeTrunkArt({
  width: W,
  height: H,
  trunk,
  presentation,
}: TreeTrunkArtProps) {
  const cx = (trunk.x + trunk.w / 2) * W;
  const top = trunk.y * H;
  const bottom = (trunk.y + trunk.h) * H + 12;
  const trunkH = bottom - top;

  return (
    <motion.svg
      className="pointer-events-none absolute z-[2]"
      style={{
        left: cx - trunk.w * W * 0.85,
        top: top - 8,
        width: trunk.w * W * 1.7,
        height: trunkH + 24,
      }}
      viewBox="0 0 140 320"
      aria-hidden
      animate={presentation ? { scaleY: [1, 1.006, 1] } : undefined}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="bark-main" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3d2818" />
          <stop offset="22%" stopColor="#5c3d28" />
          <stop offset="45%" stopColor="#7a5238" />
          <stop offset="55%" stopColor="#8b6248" />
          <stop offset="78%" stopColor="#5c3d28" />
          <stop offset="100%" stopColor="#2a1a10" />
        </linearGradient>
        <linearGradient id="bark-highlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a7050" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3d2818" stopOpacity="0" />
        </linearGradient>
        <filter id="trunk-shadow">
          <feDropShadow dx="4" dy="6" stdDeviation="5" floodColor="#1a1008" floodOpacity="0.45" />
        </filter>
      </defs>

      <g filter="url(#trunk-shadow)">
        {/* Thân chính — hình cong tự nhiên */}
        <path
          d="M70,8
             C58,40 52,90 50,140
             C48,190 46,240 44,280
             C52,295 88,300 96,280
             C94,240 92,190 90,140
             C88,90 82,40 70,8 Z"
          fill="url(#bark-main)"
        />
        {/* Highlight ánh sáng */}
        <path
          d="M68,20 C64,80 62,150 60,220 C62,250 66,270 70,275
             C72,220 74,150 72,80 C71,50 70,30 68,20 Z"
          fill="url(#bark-highlight)"
        />
        {/* Vết nứt vỏ */}
        <path d="M55,60 Q58,120 56,180" stroke="#2a1a10" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M82,90 Q80,150 84,210" stroke="#2a1a10" strokeWidth="1.2" fill="none" opacity="0.4" />
        <path d="M65,200 Q70,240 68,270" stroke="#1a1008" strokeWidth="1" fill="none" opacity="0.35" />

        {/* Nhánh phụ */}
        <path
          d="M58,100 C35,95 18,88 8,82"
          stroke="#5c3d28"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M82,115 C105,108 122,98 132,90"
          stroke="#5c3d28"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M62,55 C48,48 32,42 22,38"
          stroke="#6b4a32"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M78,48 C92,42 108,36 118,32"
          stroke="#6b4a32"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Gốc phình to */}
        <ellipse cx="70" cy="288" rx="38" ry="14" fill="#4a3020" />
        <ellipse cx="70" cy="285" rx="32" ry="10" fill="#5c3d28" opacity="0.8" />
      </g>

      {/* Rêu nhẹ */}
      <ellipse cx="52" cy="200" rx="8" ry="14" fill="#3d8b4f" opacity="0.25" />
      <ellipse cx="88" cy="170" rx="6" ry="10" fill="#4a9e5c" opacity="0.2" />
    </motion.svg>
  );
}
