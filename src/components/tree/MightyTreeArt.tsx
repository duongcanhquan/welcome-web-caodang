"use client";

import { FOLIAGE_CLUSTERS } from "@/lib/tree/branch-slots";

interface MightyTreeArtProps {
  width: number;
  height: number;
  rootsText: string;
  presentation?: boolean;
}

/**
 * Cây cổ thụ tự nhiên: đất ↔ rễ buttress ↔ thân vỏ sần ↔ tán lá phân tầng.
 * ViewBox 900×1100 — khớp slot ảnh (không đổi hệ toạ độ).
 */
export function MightyTreeArt({
  width: W,
  height: H,
  rootsText,
  presentation,
}: MightyTreeArtProps) {
  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-[1]"
      width={W}
      height={H}
      viewBox="0 0 900 1100"
      aria-hidden
    >
      <defs>
        <linearGradient id="mt-sky-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87c8e8" stopOpacity="0" />
          <stop offset="100%" stopColor="#d4e8c8" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="mt-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7bc96f" />
          <stop offset="40%" stopColor="#4a9e52" />
          <stop offset="100%" stopColor="#2d6b38" />
        </linearGradient>
        <linearGradient id="mt-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b6344" />
          <stop offset="55%" stopColor="#5c3a24" />
          <stop offset="100%" stopColor="#2e1a10" />
        </linearGradient>
        <linearGradient id="mt-bark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a1810" />
          <stop offset="18%" stopColor="#5a3a26" />
          <stop offset="42%" stopColor="#8a6244" />
          <stop offset="58%" stopColor="#a07850" />
          <stop offset="78%" stopColor="#6a4830" />
          <stop offset="100%" stopColor="#24150c" />
        </linearGradient>
        <linearGradient id="mt-bark-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4a32" />
          <stop offset="100%" stopColor="#3a2418" />
        </linearGradient>
        <radialGradient id="mt-foliage-lit" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#9fe08a" />
          <stop offset="40%" stopColor="#4db85c" />
          <stop offset="100%" stopColor="#1f6b32" />
        </radialGradient>
        <radialGradient id="mt-foliage-mid" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#5cbf68" />
          <stop offset="100%" stopColor="#185028" />
        </radialGradient>
        <radialGradient id="mt-foliage-shade" cx="60%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#3a8f48" />
          <stop offset="100%" stopColor="#0f3a1c" />
        </radialGradient>
        <linearGradient id="mt-water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8fd4f0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#2a7090" stopOpacity="0.7" />
        </linearGradient>
        <filter id="mt-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="mt-canopy-shadow">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="14"
            floodColor="#0a2010"
            floodOpacity="0.4"
          />
        </filter>
        <filter id="mt-trunk-shadow">
          <feDropShadow
            dx="4"
            dy="6"
            stdDeviation="8"
            floodColor="#1a1008"
            floodOpacity="0.45"
          />
        </filter>
      </defs>

      {/* Sương nhẹ gần mặt đất */}
      <rect x="0" y="700" width="900" height="200" fill="url(#mt-sky-haze)" />

      {/* ── Đất tầng (đáy màn hình) ── */}
      <path
        d="M0,800 C120,770 240,790 360,778 C480,766 600,792 720,780 C800,772 860,788 900,782 L900,1100 L0,1100 Z"
        fill="url(#mt-grass)"
      />
      <path
        d="M0,860 C180,838 360,872 540,850 C700,832 820,868 900,855 L900,1100 L0,1100 Z"
        fill="url(#mt-soil)"
      />
      <path
        d="M0,930 C200,918 400,942 600,925 C750,914 850,938 900,930 L900,1100 L0,1100 Z"
        fill="#24150c"
        opacity="0.55"
      />

      {/* Cỏ rải mặt đất */}
      <g stroke="#2d6b38" strokeLinecap="round" fill="none" opacity="0.75">
        {[
          [80, 812],
          [140, 808],
          [210, 816],
          [300, 806],
          [380, 814],
          [520, 808],
          [600, 816],
          [680, 810],
          [760, 818],
          [840, 812],
        ].map(([x, y], i) => (
          <g key={i}>
            <path d={`M${x},${y} Q${x - 4},${y - 14} ${x - 8},${y - 22}`} strokeWidth="2.2" />
            <path d={`M${x},${y} Q${x},${y - 16} ${x + 2},${y - 26}`} strokeWidth="2.4" />
            <path d={`M${x},${y} Q${x + 5},${y - 12} ${x + 10},${y - 20}`} strokeWidth="2" />
          </g>
        ))}
      </g>

      {/* Vũng nước nhỏ — chi tiết sống động */}
      <ellipse cx="720" cy="925" rx="88" ry="26" fill="url(#mt-water)" />
      <ellipse cx="720" cy="920" rx="58" ry="14" fill="#c8eef8" opacity="0.28" />
      <ellipse cx="160" cy="945" rx="48" ry="14" fill="url(#mt-water)" opacity="0.55" />

      {/* ── Rễ buttress + mạng rễ (tự nhiên, bám đất) ── */}
      <g filter="url(#mt-soft)">
        {/* Mảng rễ lớn hoà vào đất */}
        <path
          d="M450,800
             C410,808 370,830 320,870
             C280,900 240,930 200,955
             C230,962 280,955 320,940
             C360,920 400,890 430,850
             C440,830 445,815 450,800 Z"
          fill="url(#mt-bark-deep)"
          opacity="0.92"
        />
        <path
          d="M450,800
             C490,808 530,830 580,870
             C620,900 660,930 700,955
             C670,962 620,955 580,940
             C540,920 500,890 470,850
             C460,830 455,815 450,800 Z"
          fill="url(#mt-bark-deep)"
          opacity="0.92"
        />
        <path
          d="M450,805
             C430,850 425,900 420,960
             C440,968 460,968 480,960
             C475,900 470,850 450,805 Z"
          fill="#4a3020"
          opacity="0.9"
        />

        {/* Rễ con dạng dây */}
        <g
          stroke="#3a2418"
          strokeLinecap="round"
          fill="none"
          opacity="0.88"
        >
          <path d="M420,820 C360,860 300,900 250,940 C230,955 210,968 185,980" strokeWidth="7" />
          <path d="M480,820 C540,860 600,900 650,940 C670,955 690,968 715,980" strokeWidth="7" />
          <path d="M435,830 C390,880 360,930 340,985" strokeWidth="5" />
          <path d="M465,830 C510,880 540,930 560,985" strokeWidth="5" />
          <path d="M400,825 C340,855 290,885 255,910" strokeWidth="4" opacity="0.7" />
          <path d="M500,825 C560,855 610,885 645,910" strokeWidth="4" opacity="0.7" />
          <path d="M445,840 C420,900 410,950 405,1005" strokeWidth="3.5" opacity="0.65" />
          <path d="M455,840 C480,900 490,950 495,1005" strokeWidth="3.5" opacity="0.65" />
          <path d="M380,855 C330,890 290,920 270,945" strokeWidth="3" opacity="0.55" />
          <path d="M520,855 C570,890 610,920 630,945" strokeWidth="3" opacity="0.55" />
        </g>
      </g>

      {/* ── Tán lá phân tầng (rộng, hữu cơ) ── */}
      <g filter="url(#mt-canopy-shadow)">
        {FOLIAGE_CLUSTERS.map((c, i) => {
          const cx = c.cx * 900;
          const cy = c.cy * 1100;
          const rx = c.rx * 900 * 1.42;
          const ry = c.ry * 1100 * 1.48;
          const fill =
            i % 3 === 0
              ? "url(#mt-foliage-lit)"
              : i % 3 === 1
                ? "url(#mt-foliage-mid)"
                : "url(#mt-foliage-shade)";
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={fill}
              opacity={0.9 - (i % 4) * 0.04}
            />
          );
        })}
        {/* Khối trung tâm + “lá” phụ tạo chiều sâu */}
        <ellipse cx="450" cy="265" rx="220" ry="145" fill="url(#mt-foliage-lit)" opacity="0.72" />
        <ellipse cx="450" cy="310" rx="175" ry="110" fill="url(#mt-foliage-shade)" opacity="0.55" />
        <ellipse cx="320" cy="240" rx="95" ry="70" fill="url(#mt-foliage-mid)" opacity="0.5" />
        <ellipse cx="580" cy="240" rx="95" ry="70" fill="url(#mt-foliage-mid)" opacity="0.5" />
        <ellipse cx="450" cy="175" rx="110" ry="80" fill="url(#mt-foliage-lit)" opacity="0.45" />
      </g>

      {/* ── Nhánh chính (taper, hữu cơ) ── */}
      <g strokeLinecap="round" fill="none" opacity="0.92">
        <path d="M450,500 C340,470 230,400 150,350" stroke="#4a3020" strokeWidth="16" />
        <path d="M450,500 C560,470 670,400 750,350" stroke="#4a3020" strokeWidth="16" />
        <path d="M450,470 C370,400 290,290 240,195" stroke="#5c3d28" strokeWidth="12" />
        <path d="M450,470 C530,400 610,290 660,195" stroke="#5c3d28" strokeWidth="12" />
        <path d="M450,450 C415,340 395,220 385,130" stroke="#5c3d28" strokeWidth="11" />
        <path d="M450,450 C485,340 505,220 515,130" stroke="#5c3d28" strokeWidth="11" />
        <path d="M450,490 C450,360 450,230 450,120" stroke="#3d2818" strokeWidth="13" />
        <path d="M450,530 C355,505 295,465 265,430" stroke="#4a3020" strokeWidth="9" />
        <path d="M450,530 C545,505 605,465 635,430" stroke="#4a3020" strokeWidth="9" />
        <path d="M450,550 C380,525 330,490 305,460" stroke="#5c3d28" strokeWidth="7" />
        <path d="M450,550 C520,525 570,490 595,460" stroke="#5c3d28" strokeWidth="7" />
        {/* Nhánh phụ */}
        <path d="M280,380 C240,360 200,355 170,365" stroke="#5c3d28" strokeWidth="5" opacity="0.8" />
        <path d="M620,380 C660,360 700,355 730,365" stroke="#5c3d28" strokeWidth="5" opacity="0.8" />
        <path d="M300,250 C270,220 255,190 250,165" stroke="#6b4a32" strokeWidth="4.5" opacity="0.75" />
        <path d="M600,250 C630,220 645,190 650,165" stroke="#6b4a32" strokeWidth="4.5" opacity="0.75" />
      </g>

      {/* ── Thân taper + vân vỏ ── */}
      <g filter="url(#mt-trunk-shadow)">
        <path
          d="M450,118
             C428,240 418,380 412,540
             C408,660 404,740 400,798
             C418,818 482,822 500,798
             C496,740 492,660 488,540
             C482,380 472,240 450,118 Z"
          fill="url(#mt-bark)"
        />
        {/* Highlight sáng cạnh trái */}
        <path
          d="M442,160 C435,320 430,500 426,720 C438,735 446,732 452,720
             C454,500 456,320 458,160 Z"
          fill="#c4a07a"
          opacity="0.18"
        />
        {/* Rãnh vỏ */}
        <g stroke="#2a1810" strokeLinecap="round" fill="none" opacity="0.35">
          <path d="M435,200 C432,350 430,500 428,680" strokeWidth="2" />
          <path d="M465,210 C468,360 470,510 472,690" strokeWidth="1.8" />
          <path d="M448,180 C446,400 445,580 444,750" strokeWidth="1.4" />
          <path d="M422,320 C418,420 416,520 414,620" strokeWidth="1.2" />
          <path d="M478,340 C482,440 484,540 486,640" strokeWidth="1.2" />
        </g>
        {/* Gốc phình (flare) */}
        <ellipse cx="450" cy="800" rx="58" ry="20" fill="#3a2418" />
        <ellipse cx="450" cy="796" rx="48" ry="14" fill="#5c3d28" opacity="0.9" />
      </g>

      {/* Cỏ ôm gốc */}
      <ellipse cx="450" cy="792" rx="78" ry="18" fill="#3d8b4f" opacity="0.65" />
      <g stroke="#2d6b38" strokeLinecap="round" fill="none">
        <path d="M400,790 Q396,772 392,760" strokeWidth="2.5" />
        <path d="M420,788 Q418,768 416,755" strokeWidth="2.8" />
        <path d="M450,786 Q450,766 452,752" strokeWidth="3" />
        <path d="M480,788 Q482,768 484,755" strokeWidth="2.8" />
        <path d="M500,790 Q504,772 508,760" strokeWidth="2.5" />
      </g>

      {/* Chữ gốc — chân đất */}
      <text
        x="450"
        y="1055"
        textAnchor="middle"
        fill={presentation ? "#FFE08A" : "rgba(255,255,255,0.92)"}
        fontSize="16"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="0.04em"
      >
        {rootsText}
      </text>
    </svg>
  );
}
