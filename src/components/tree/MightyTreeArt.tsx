"use client";

import { motion } from "motion/react";
import { FOLIAGE_CLUSTERS } from "@/lib/tree/branch-slots";

interface MightyTreeArtProps {
  width: number;
  height: number;
  rootsText: string;
  presentation?: boolean;
}

/**
 * Một cây thống nhất: đất → rễ → thân → nhánh → tán lá xanh lớn.
 * Ảnh sinh viên gắn TRÊN các tán (render riêng phía trên).
 */
export function MightyTreeArt({
  width: W,
  height: H,
  rootsText,
  presentation,
}: MightyTreeArtProps) {
  return (
    <motion.svg
      className="pointer-events-none absolute left-0 top-0 z-[1]"
      width={W}
      height={H}
      viewBox="0 0 900 1100"
      aria-hidden
      animate={presentation ? { scale: [1, 1.003, 1] } : undefined}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="mt-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5aad62" />
          <stop offset="100%" stopColor="#2d6b38" />
        </linearGradient>
        <linearGradient id="mt-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4a32" />
          <stop offset="100%" stopColor="#3a2418" />
        </linearGradient>
        <linearGradient id="mt-bark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3d2818" />
          <stop offset="30%" stopColor="#6b4a32" />
          <stop offset="50%" stopColor="#8b6248" />
          <stop offset="70%" stopColor="#6b4a32" />
          <stop offset="100%" stopColor="#2a1a10" />
        </linearGradient>
        <radialGradient id="mt-foliage" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#6ecf7a" />
          <stop offset="55%" stopColor="#3a9e4a" />
          <stop offset="100%" stopColor="#1e6b30" />
        </radialGradient>
        <radialGradient id="mt-foliage-deep" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a9e58" />
          <stop offset="100%" stopColor="#1a5028" />
        </radialGradient>
        <linearGradient id="mt-water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ec8e8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2a7a9e" stopOpacity="0.75" />
        </linearGradient>
        <filter id="mt-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0a2010" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ── Đất & cỏ (nối liền gốc) ── */}
      <path d="M0,820 Q200,790 450,805 T900,815 L900,1100 L0,1100 Z" fill="url(#mt-grass)" />
      <path d="M0,860 Q450,830 900,860 L900,1100 L0,1100 Z" fill="url(#mt-soil)" />
      <ellipse cx="700" cy="920" rx="100" ry="32" fill="url(#mt-water)" opacity="0.85" />
      <ellipse cx="700" cy="915" rx="70" ry="18" fill="#9ee0f5" opacity="0.3" />

      {/* Rễ — từ gốc thân xuống đất */}
      <g stroke="#4a3020" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M450,810 C400,850 350,890 280,940" strokeWidth="11" />
        <path d="M450,810 C500,850 550,890 620,940" strokeWidth="11" />
        <path d="M450,815 C450,870 448,920 445,970" strokeWidth="9" />
        <path d="M450,812 C380,840 320,870 250,900" strokeWidth="6" opacity="0.6" />
        <path d="M450,812 C520,840 580,870 650,900" strokeWidth="6" opacity="0.6" />
      </g>

      {/* ── Tán lá xanh lớn (nền cho ảnh) ── */}
      <g filter="url(#mt-shadow)" opacity="0.92">
        {FOLIAGE_CLUSTERS.map((c, i) => {
          const cx = c.cx * 900;
          const cy = c.cy * 1100;
          const rx = c.rx * 900 * 1.35;
          const ry = c.ry * 1100 * 1.4;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={i % 2 === 0 ? "url(#mt-foliage)" : "url(#mt-foliage-deep)"}
              opacity={0.88 - (i % 3) * 0.05}
            />
          );
        })}
        {/* Tán trung tâm lớn — che chỗ nối nhánh */}
        <ellipse cx="450" cy="280" rx="200" ry="130" fill="url(#mt-foliage)" opacity="0.75" />
        <ellipse cx="450" cy="300" rx="160" ry="100" fill="url(#mt-foliage-deep)" opacity="0.6" />
      </g>

      {/* ── Nhánh (từ thân ra các tán) ── */}
      <g strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M450,520 C350,480 220,400 140,360" stroke="#5c3d28" strokeWidth="14" />
        <path d="M450,520 C550,480 680,400 760,360" stroke="#5c3d28" strokeWidth="14" />
        <path d="M450,480 C380,400 300,280 250,200" stroke="#6b4a32" strokeWidth="11" />
        <path d="M450,480 C520,400 600,280 650,200" stroke="#6b4a32" strokeWidth="11" />
        <path d="M450,460 C420,350 400,220 400,140" stroke="#6b4a32" strokeWidth="10" />
        <path d="M450,460 C480,350 500,220 500,140" stroke="#6b4a32" strokeWidth="10" />
        <path d="M450,500 C450,380 450,250 450,130" stroke="#5c3d28" strokeWidth="12" />
        <path d="M450,540 C360,500 300,460 280,430" stroke="#5c3d28" strokeWidth="9" />
        <path d="M450,540 C540,500 600,460 620,430" stroke="#5c3d28" strokeWidth="9" />
        <path d="M450,560 C390,520 340,480 320,450" stroke="#6b4a32" strokeWidth="7" />
        <path d="M450,560 C510,520 560,480 580,450" stroke="#6b4a32" strokeWidth="7" />
      </g>

      {/* ── Thân cây (nối tán ↔ đất) ── */}
      <g filter="url(#mt-shadow)">
        <path
          d="M450,130
             C430,250 420,400 415,560
             C412,680 410,760 408,810
             C420,825 480,830 492,810
             C490,760 488,680 485,560
             C480,400 470,250 450,130 Z"
          fill="url(#mt-bark)"
        />
        <path
          d="M445,200 C442,400 440,600 438,780 C448,790 452,790 462,780
             C460,600 458,400 455,200 Z"
          fill="#9a7050"
          opacity="0.2"
        />
        <ellipse cx="450" cy="815" rx="52" ry="18" fill="#4a3020" />
        <ellipse cx="450" cy="812" rx="44" ry="14" fill="#5c3d28" opacity="0.85" />
      </g>

      {/* Cỏ che gốc */}
      <ellipse cx="450" cy="808" rx="70" ry="16" fill="#3d8b4f" opacity="0.7" />

      {/* Chữ gốc */}
      <text
        x="450"
        y="1040"
        textAnchor="middle"
        fill={presentation ? "#FFD15C" : "rgba(255,255,255,0.9)"}
        fontSize="15"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {rootsText}
      </text>
    </motion.svg>
  );
}
