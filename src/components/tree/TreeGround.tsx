"use client";

interface TreeGroundProps {
  width: number;
  height: number;
  groundY: number;
  groundH: number;
  rootsText: string;
  presentation?: boolean;
}

/** Lớp đất, cỏ, nước và rễ cây */
export function TreeGround({
  width: W,
  height: H,
  groundY,
  groundH,
  rootsText,
  presentation,
}: TreeGroundProps) {
  const top = groundY * H;
  const gh = groundH * H;

  return (
    <div
      className="pointer-events-none absolute left-0 z-[1]"
      style={{ top, width: W, height: gh }}
    >
      <svg
        viewBox="0 0 900 290"
        className="h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="grass-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a9e5c" />
            <stop offset="40%" stopColor="#3d8b4f" />
            <stop offset="100%" stopColor="#2d6b3a" />
          </linearGradient>
          <linearGradient id="soil-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b4a32" />
            <stop offset="100%" stopColor="#3d2818" />
          </linearGradient>
          <linearGradient id="water-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5ec4e8" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#3a9ec4" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#2a7a9e" stopOpacity="0.65" />
          </linearGradient>
          <filter id="water-shimmer">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" />
            <feDisplacementMap in="SourceGraphic" scale="3" />
          </filter>
        </defs>

        {/* Đồi cỏ */}
        <path
          d="M0,45 Q120,8 250,28 T450,18 T650,32 T900,22 L900,290 L0,290 Z"
          fill="url(#grass-grad)"
        />
        <path
          d="M0,55 Q200,35 400,48 T900,42 L900,290 L0,290 Z"
          fill="#35804a"
          opacity="0.35"
        />

        {/* Lớp đất */}
        <path
          d="M0,95 Q450,75 900,95 L900,290 L0,290 Z"
          fill="url(#soil-grad)"
        />

        {/* Ao nước / suối nhỏ */}
        <ellipse cx="720" cy="175" rx="110" ry="38" fill="url(#water-grad)" opacity="0.9" />
        <ellipse cx="720" cy="172" rx="85" ry="22" fill="#7dd4f0" opacity="0.35" />
        <path
          d="M680,175 Q720,160 760,175 Q720,190 680,175"
          fill="none"
          stroke="#a8e8ff"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Rễ cây — lan ra từ giữa */}
        <g stroke="#4a3020" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M450,88 C420,120 380,145 340,168" strokeWidth="9" />
          <path d="M450,88 C480,118 520,142 560,162" strokeWidth="8" />
          <path d="M450,92 C450,130 448,155 445,178" strokeWidth="7" />
          <path d="M450,90 C410,108 370,125 320,138" strokeWidth="5" opacity="0.7" />
          <path d="M450,90 C490,106 530,122 580,135" strokeWidth="5" opacity="0.7" />
          <path d="M450,95 C430,140 420,165 400,185" strokeWidth="4" opacity="0.6" />
          <path d="M450,95 C470,138 485,162 500,182" strokeWidth="4" opacity="0.6" />
        </g>
        {/* Rễ phụ nhỏ chìm xuống đất */}
        <g stroke="#3d2818" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M340,168 C320,185 300,200 280,215" strokeWidth="4" />
          <path d="M560,162 C580,180 600,198 620,212" strokeWidth="4" />
          <path d="M445,178 C435,200 428,220 420,240" strokeWidth="3" />
        </g>

        {/* Cỏ che gốc */}
        <ellipse cx="450" cy="88" rx="55" ry="18" fill="#3d8b4f" opacity="0.85" />
      </svg>

      <p
        className={`absolute bottom-[8%] left-0 right-0 text-center font-display text-xs font-bold tracking-wider drop-shadow-md sm:text-sm ${
          presentation ? "text-honey/95" : "text-white/90"
        }`}
      >
        {rootsText}
      </p>
    </div>
  );
}
