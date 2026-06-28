"use client";

import { HEART_CLIP_PATH, HEART_VIEWBOX } from "@/lib/tree";
import type { TreeLeaf } from "@/lib/tree/types";

interface TreeLeafNodeProps {
  leaf: TreeLeaf;
  canvasW: number;
  canvasH: number;
  baseSize?: number;
  highlighted?: boolean;
  isNew?: boolean;
  presentation?: boolean;
  windSway?: boolean;
  swayDelay?: number;
  onClick?: (leaf: TreeLeaf) => void;
}

export function TreeLeafNode({
  leaf,
  canvasW,
  canvasH,
  baseSize = 48,
  highlighted = false,
  isNew = false,
  presentation = false,
  windSway = false,
  swayDelay = 0,
  onClick,
}: TreeLeafNodeProps) {
  if (leaf.filler && !leaf.leafUrl) {
    return (
      <FillerLeaf
        leaf={leaf}
        canvasW={canvasW}
        canvasH={canvasH}
        baseSize={baseSize}
        windSway={windSway}
        swayDelay={swayDelay}
      />
    );
  }

  const size = baseSize * leaf.scale;
  const left = leaf.x * canvasW - size / 2;
  const top = leaf.y * canvasH - size / 2;
  const clickable = !leaf.filler && Boolean(leaf.submissionId);

  const swayClass =
    windSway || presentation ? "animate-leaf-wind" : "";

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onClick?.(leaf)}
      className={`absolute origin-center transition-all duration-500 ${swayClass} ${
        clickable ? "cursor-pointer hover:z-20 hover:scale-110" : "cursor-default pointer-events-none"
      } ${isNew ? "animate-leaf-pop" : ""} ${
        highlighted ? "z-30 !scale-[1.35]" : ""
      }`}
      style={{
        left,
        top,
        width: size,
        height: size,
        ["--leaf-rot" as string]: `${leaf.rotation}deg`,
        animationDelay: `${swayDelay}s`,
        filter: highlighted
          ? "drop-shadow(0 0 16px #FFD15C) drop-shadow(0 0 32px #FFAE3B) drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
          : "drop-shadow(0 3px 6px rgba(26,48,32,0.35))",
      }}
      aria-label={leaf.name ?? "Lá trang trí"}
    >
      <div
        className="h-full w-full"
        style={{ transform: `rotate(${leaf.rotation}deg)` }}
      >
        <svg viewBox={HEART_VIEWBOX} className="h-full w-full">
          <defs>
            <clipPath id={`heart-clip-${leaf.id}`}>
              <path d={HEART_CLIP_PATH} />
            </clipPath>
          </defs>
          {leaf.leafUrl ? (
            <image
              href={leaf.leafUrl}
              width="24"
              height="22"
              clipPath={`url(#heart-clip-${leaf.id})`}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <path d={HEART_CLIP_PATH} fill={leaf.majorColor} opacity={0.6} />
          )}
          <path
            d={HEART_CLIP_PATH}
            fill="none"
            stroke={leaf.majorColor}
            strokeWidth={0.6}
            opacity={0.85}
          />
        </svg>
        {leaf.blossom && (
          <span className="absolute -right-1 -top-1 animate-float text-lg">🌸</span>
        )}
      </div>
    </button>
  );
}

function FillerLeaf({
  leaf,
  canvasW,
  canvasH,
  baseSize,
  windSway,
  swayDelay = 0,
}: {
  leaf: TreeLeaf;
  canvasW: number;
  canvasH: number;
  baseSize: number;
  windSway?: boolean;
  swayDelay?: number;
}) {
  const size = baseSize * leaf.scale * 0.85;
  const left = leaf.x * canvasW - size / 2;
  const top = leaf.y * canvasH - size / 2;

  return (
    <div
      className={`absolute pointer-events-none opacity-50 ${windSway ? "animate-leaf-wind" : ""}`}
      style={{
        left,
        top,
        width: size,
        height: size,
        ["--leaf-rot" as string]: `${leaf.rotation}deg`,
        animationDelay: `${swayDelay}s`,
      }}
    >
      <div style={{ transform: `rotate(${leaf.rotation}deg)` }}>
        <svg viewBox={HEART_VIEWBOX} className="h-full w-full">
          <path d={HEART_CLIP_PATH} fill={leaf.majorColor} opacity={0.35} />
        </svg>
      </div>
    </div>
  );
}
