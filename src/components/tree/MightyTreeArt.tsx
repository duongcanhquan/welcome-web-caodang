"use client";

import { useId } from "react";
import { FOLIAGE_CLUSTERS } from "@/lib/tree/branch-slots";
import { GROUND_WORDS, groundWordFill } from "@/lib/tree/ground-words";

interface MightyTreeArtProps {
  width: number;
  height: number;
  rootsText: string;
  presentation?: boolean;
}

/**
 * Cây cổ thụ tự nhiên: đất chữ đa ngôn ngữ ↔ rễ ↔ thân ↔ tán sâu.
 * ViewBox 900×1100 — khớp slot ảnh.
 */
export function MightyTreeArt({
  width: W,
  height: H,
  rootsText,
  presentation,
}: MightyTreeArtProps) {
  const uid = useId().replace(/:/g, "");
  const g = (name: string) => `${name}-${uid}`;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-[1]"
      width={W}
      height={H}
      viewBox="0 0 900 1100"
      aria-hidden
    >
      <defs>
        <linearGradient id={g("haze")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87c8e8" stopOpacity="0" />
          <stop offset="100%" stopColor="#d4e8c8" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={g("grass")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fd47a" />
          <stop offset="35%" stopColor="#4a9e52" />
          <stop offset="100%" stopColor="#2a6034" />
        </linearGradient>
        <linearGradient id={g("soil")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a6f48" />
          <stop offset="40%" stopColor="#6b4428" />
          <stop offset="100%" stopColor="#2a160c" />
        </linearGradient>
        <linearGradient id={g("bark")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e120a" />
          <stop offset="15%" stopColor="#4a3020" />
          <stop offset="38%" stopColor="#8a6244" />
          <stop offset="52%" stopColor="#b08858" />
          <stop offset="72%" stopColor="#6a4830" />
          <stop offset="100%" stopColor="#1a1008" />
        </linearGradient>
        <linearGradient id={g("barkDeep")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4a32" />
          <stop offset="100%" stopColor="#2e1a10" />
        </linearGradient>
        <radialGradient id={g("folLit")} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#b4f098" />
          <stop offset="35%" stopColor="#5cc868" />
          <stop offset="100%" stopColor="#1a5c2c" />
        </radialGradient>
        <radialGradient id={g("folMid")} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#6ecf72" />
          <stop offset="100%" stopColor="#145028" />
        </radialGradient>
        <radialGradient id={g("folShade")} cx="62%" cy="58%" r="52%">
          <stop offset="0%" stopColor="#3a9048" />
          <stop offset="100%" stopColor="#0a3018" />
        </radialGradient>
        <linearGradient id={g("water")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a8e4f8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2a7090" stopOpacity="0.65" />
        </linearGradient>
        <radialGradient id={g("moss")} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#7cbc58" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#2d6030" stopOpacity="0.15" />
        </radialGradient>
        <filter id={g("soft")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={g("canopy")}>
          <feDropShadow
            dx="0"
            dy="12"
            stdDeviation="16"
            floodColor="#061808"
            floodOpacity="0.45"
          />
        </filter>
        <filter id={g("trunk")}>
          <feDropShadow
            dx="5"
            dy="8"
            stdDeviation="10"
            floodColor="#120c06"
            floodOpacity="0.5"
          />
        </filter>
        <pattern
          id={g("soilNoise")}
          patternUnits="userSpaceOnUse"
          width="28"
          height="28"
        >
          <circle cx="4" cy="8" r="1.2" fill="#1a1008" opacity="0.25" />
          <circle cx="16" cy="18" r="0.9" fill="#c4a070" opacity="0.15" />
          <circle cx="22" cy="6" r="1" fill="#1a1008" opacity="0.2" />
          <circle cx="10" cy="22" r="0.7" fill="#8a6244" opacity="0.2" />
        </pattern>
      </defs>

      {/* Sương gần đất */}
      <rect x="0" y="680" width="900" height="220" fill={`url(#${g("haze")})`} />

      {/* ── Đất tầng ── */}
      <path
        d="M0,792 C100,762 220,785 340,770 C460,755 580,788 700,772 C800,760 860,780 900,775 L900,1100 L0,1100 Z"
        fill={`url(#${g("grass")})`}
      />
      <path
        d="M0,848 C160,828 340,862 520,840 C680,822 820,858 900,845 L900,1100 L0,1100 Z"
        fill={`url(#${g("soil")})`}
      />
      <path
        d="M0,848 C160,828 340,862 520,840 C680,822 820,858 900,845 L900,1100 L0,1100 Z"
        fill={`url(#${g("soilNoise")})`}
        opacity="0.55"
      />
      <path
        d="M0,922 C200,908 400,938 600,918 C750,904 850,932 900,922 L900,1100 L0,1100 Z"
        fill="#1a1008"
        opacity="0.5"
      />

      {/* Cỏ rải */}
      <g stroke="#1f5a2c" strokeLinecap="round" fill="none" opacity="0.8">
        {[
          [55, 808],
          [110, 800],
          [175, 812],
          [250, 798],
          [320, 810],
          [390, 802],
          [510, 806],
          [580, 800],
          [650, 814],
          [720, 804],
          [790, 816],
          [855, 808],
        ].map(([x, y], i) => (
          <g key={i}>
            <path
              d={`M${x},${y} Q${x - 5},${y - 16} ${x - 10},${y - 26}`}
              strokeWidth="2.3"
            />
            <path
              d={`M${x},${y} Q${x},${y - 18} ${x + 3},${y - 28}`}
              strokeWidth="2.6"
            />
            <path
              d={`M${x},${y} Q${x + 6},${y - 14} ${x + 12},${y - 22}`}
              strokeWidth="2.1"
            />
          </g>
        ))}
      </g>

      {/* Vũng nước */}
      <ellipse cx="730" cy="928" rx="92" ry="28" fill={`url(#${g("water")})`} />
      <ellipse cx="730" cy="922" rx="60" ry="14" fill="#d8f4fc" opacity="0.3" />
      <ellipse
        cx="145"
        cy="952"
        rx="52"
        ry="15"
        fill={`url(#${g("water")})`}
        opacity="0.5"
      />

      {/* ── Chữ trên đất (Welcome / ngành / động lực) ── */}
      <g style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {GROUND_WORDS.map((w, i) => (
          <text
            key={`${w.text}-${i}`}
            x={w.x}
            y={w.y}
            textAnchor="middle"
            fill={groundWordFill(w.kind, presentation)}
            fontSize={w.size}
            fontWeight={w.kind === "welcome" ? 700 : 600}
            opacity={presentation ? Math.min(1, w.opacity + 0.18) : w.opacity}
            transform={`rotate(${w.rotate} ${w.x} ${w.y})`}
            letterSpacing="0.02em"
          >
            {w.text}
          </text>
        ))}
      </g>

      {/* ── Rễ buttress ── */}
      <g filter={`url(#${g("soft")})`}>
        <path
          d="M450,800
             C405,810 360,835 310,875
             C265,910 220,945 175,972
             C210,980 270,970 320,952
             C365,930 410,890 435,848
             C442,828 446,812 450,800 Z"
          fill={`url(#${g("barkDeep")})`}
          opacity="0.94"
        />
        <path
          d="M450,800
             C495,810 540,835 590,875
             C635,910 680,945 725,972
             C690,980 630,970 580,952
             C535,930 490,890 465,848
             C458,828 454,812 450,800 Z"
          fill={`url(#${g("barkDeep")})`}
          opacity="0.94"
        />
        <path
          d="M450,805
             C428,855 422,910 416,968
             C438,978 462,978 484,968
             C478,910 472,855 450,805 Z"
          fill="#3d2818"
          opacity="0.92"
        />
        <g stroke="#2a1810" strokeLinecap="round" fill="none" opacity="0.9">
          <path
            d="M418,822 C355,865 290,912 235,952 C210,968 188,982 160,992"
            strokeWidth="8"
          />
          <path
            d="M482,822 C545,865 610,912 665,952 C690,968 712,982 740,992"
            strokeWidth="8"
          />
          <path d="M432,835 C385,888 350,942 328,998" strokeWidth="5.5" />
          <path d="M468,835 C515,888 550,942 572,998" strokeWidth="5.5" />
          <path
            d="M398,828 C335,860 280,895 248,925"
            strokeWidth="4.2"
            opacity="0.7"
          />
          <path
            d="M502,828 C565,860 620,895 652,925"
            strokeWidth="4.2"
            opacity="0.7"
          />
          <path
            d="M442,845 C418,910 408,965 402,1020"
            strokeWidth="3.8"
            opacity="0.6"
          />
          <path
            d="M458,845 C482,910 492,965 498,1020"
            strokeWidth="3.8"
            opacity="0.6"
          />
        </g>
      </g>

      {/* ── Tán lá sâu hơn ── */}
      <g filter={`url(#${g("canopy")})`}>
        {FOLIAGE_CLUSTERS.map((c, i) => {
          const cx = c.cx * 900;
          const cy = c.cy * 1100;
          const rx = c.rx * 900 * 1.48;
          const ry = c.ry * 1100 * 1.55;
          const fill =
            i % 3 === 0
              ? `url(#${g("folLit")})`
              : i % 3 === 1
                ? `url(#${g("folMid")})`
                : `url(#${g("folShade")})`;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={fill}
              opacity={0.92 - (i % 4) * 0.04}
            />
          );
        })}
        <ellipse
          cx="450"
          cy="255"
          rx="235"
          ry="155"
          fill={`url(#${g("folLit")})`}
          opacity="0.75"
        />
        <ellipse
          cx="450"
          cy="305"
          rx="185"
          ry="115"
          fill={`url(#${g("folShade")})`}
          opacity="0.58"
        />
        <ellipse
          cx="305"
          cy="230"
          rx="105"
          ry="78"
          fill={`url(#${g("folMid")})`}
          opacity="0.55"
        />
        <ellipse
          cx="595"
          cy="230"
          rx="105"
          ry="78"
          fill={`url(#${g("folMid")})`}
          opacity="0.55"
        />
        <ellipse
          cx="450"
          cy="165"
          rx="120"
          ry="88"
          fill={`url(#${g("folLit")})`}
          opacity="0.5"
        />
        {/* Điểm lá / texture */}
        {[
          [280, 200],
          [360, 160],
          [450, 140],
          [540, 165],
          [620, 205],
          [320, 280],
          [400, 250],
          [500, 245],
          [580, 290],
          [240, 320],
          [660, 315],
          [380, 340],
          [520, 350],
        ].map(([x, y], i) => (
          <circle
            key={`leaf-${i}`}
            cx={x}
            cy={y}
            r={5 + (i % 4)}
            fill={i % 2 === 0 ? "#9fe878" : "#1f6b32"}
            opacity={0.35 + (i % 3) * 0.08}
          />
        ))}
      </g>

      {/* ── Nhánh ── */}
      <g strokeLinecap="round" fill="none" opacity="0.93">
        <path
          d="M450,505 C335,472 220,395 135,340"
          stroke="#3d2818"
          strokeWidth="17"
        />
        <path
          d="M450,505 C565,472 680,395 765,340"
          stroke="#3d2818"
          strokeWidth="17"
        />
        <path
          d="M450,472 C365,398 280,285 228,185"
          stroke="#5c3d28"
          strokeWidth="13"
        />
        <path
          d="M450,472 C535,398 620,285 672,185"
          stroke="#5c3d28"
          strokeWidth="13"
        />
        <path
          d="M450,448 C412,335 390,210 378,118"
          stroke="#5c3d28"
          strokeWidth="12"
        />
        <path
          d="M450,448 C488,335 510,210 522,118"
          stroke="#5c3d28"
          strokeWidth="12"
        />
        <path
          d="M450,495 C450,350 450,220 450,108"
          stroke="#2e1c10"
          strokeWidth="14"
        />
        <path
          d="M450,535 C350,508 288,465 255,425"
          stroke="#4a3020"
          strokeWidth="10"
        />
        <path
          d="M450,535 C550,508 612,465 645,425"
          stroke="#4a3020"
          strokeWidth="10"
        />
        <path
          d="M450,555 C375,528 320,490 292,455"
          stroke="#5c3d28"
          strokeWidth="7.5"
        />
        <path
          d="M450,555 C525,528 580,490 608,455"
          stroke="#5c3d28"
          strokeWidth="7.5"
        />
        <path
          d="M270,375 C228,352 188,348 155,360"
          stroke="#5c3d28"
          strokeWidth="5.5"
          opacity="0.85"
        />
        <path
          d="M630,375 C672,352 712,348 745,360"
          stroke="#5c3d28"
          strokeWidth="5.5"
          opacity="0.85"
        />
        <path
          d="M295,245 C262,210 248,178 242,150"
          stroke="#6b4a32"
          strokeWidth="4.8"
          opacity="0.8"
        />
        <path
          d="M605,245 C638,210 652,178 658,150"
          stroke="#6b4a32"
          strokeWidth="4.8"
          opacity="0.8"
        />
      </g>

      {/* ── Thân + rêu ── */}
      <g filter={`url(#${g("trunk")})`}>
        <path
          d="M450,108
             C425,235 414,380 408,545
             C403,670 398,745 394,798
             C415,822 485,826 506,798
             C502,745 497,670 492,545
             C486,380 475,235 450,108 Z"
          fill={`url(#${g("bark")})`}
        />
        <path
          d="M440,155 C432,320 426,505 422,725 C436,742 446,738 452,725
             C454,505 456,320 460,155 Z"
          fill="#d4b08a"
          opacity="0.2"
        />
        <g stroke="#1a1008" strokeLinecap="round" fill="none" opacity="0.38">
          <path d="M432,195 C428,355 425,510 422,690" strokeWidth="2.2" />
          <path d="M468,205 C472,365 475,520 478,695" strokeWidth="2" />
          <path d="M448,170 C445,400 443,585 442,760" strokeWidth="1.5" />
          <path d="M418,310 C413,420 410,530 407,640" strokeWidth="1.3" />
          <path d="M482,330 C487,440 490,550 493,655" strokeWidth="1.3" />
        </g>
        {/* Nốt mắt gỗ */}
        <ellipse
          cx="458"
          cy="380"
          rx="7"
          ry="11"
          fill="#2a1810"
          opacity="0.28"
        />
        <ellipse
          cx="435"
          cy="520"
          rx="5"
          ry="8"
          fill="#2a1810"
          opacity="0.22"
        />
        {/* Rêu gốc */}
        <ellipse
          cx="428"
          cy="760"
          rx="22"
          ry="28"
          fill={`url(#${g("moss")})`}
        />
        <ellipse
          cx="478"
          cy="755"
          rx="18"
          ry="24"
          fill={`url(#${g("moss")})`}
        />
        <ellipse cx="450" cy="800" rx="62" ry="22" fill="#2e1a10" />
        <ellipse
          cx="450"
          cy="795"
          rx="50"
          ry="15"
          fill="#5c3d28"
          opacity="0.92"
        />
      </g>

      {/* Cỏ ôm gốc */}
      <ellipse cx="450" cy="790" rx="85" ry="20" fill="#3d8b4f" opacity="0.7" />
      <g stroke="#1f5a2c" strokeLinecap="round" fill="none">
        <path d="M395,788 Q390,768 384,752" strokeWidth="2.6" />
        <path d="M415,786 Q412,764 408,748" strokeWidth="2.9" />
        <path d="M450,784 Q450,760 452,744" strokeWidth="3.2" />
        <path d="M485,786 Q488,764 492,748" strokeWidth="2.9" />
        <path d="M505,788 Q510,768 516,752" strokeWidth="2.6" />
      </g>

      {/* Nhãn sự kiện giữa đáy — vẫn giữ rootsText */}
      {rootsText ? (
        <text
          x="450"
          y="1095"
          textAnchor="middle"
          fill={presentation ? "#FFE08A" : "rgba(255,255,255,0.75)"}
          fontSize="13"
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="0.06em"
          opacity="0.85"
        >
          {rootsText}
        </text>
      ) : null}
    </svg>
  );
}
