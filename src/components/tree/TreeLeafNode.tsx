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
  onClick,
}: TreeLeafNodeProps) {
  if (leaf.filler && !leaf.leafUrl) {
    return (
      <FillerLeaf
        leaf={leaf}
        canvasW={canvasW}
        canvasH={canvasH}
        baseSize={baseSize}
      />
    );
  }

  const size = baseSize * leaf.scale;
  const left = leaf.x * canvasW - size / 2;
  const top = leaf.y * canvasH - size / 2;
  const clickable = !leaf.filler && Boolean(leaf.submissionId);

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onClick?.(leaf)}
      className={`absolute origin-center transition-all duration-500 ${
        clickable ? "cursor-pointer hover:z-20" : "cursor-default pointer-events-none"
      } ${isNew ? "animate-leaf-pop" : ""} ${
        highlighted ? "z-30 scale-125" : ""
      } ${presentation ? "animate-leaf-sway" : ""}`}
      style={{
        left,
        top,
        width: size,
        height: size,
        transform: `rotate(${leaf.rotation}deg)`,
        filter: highlighted
          ? "drop-shadow(0 0 12px #FFD15C) drop-shadow(0 0 24px #FFAE3B)"
          : "drop-shadow(0 2px 4px rgba(42,34,48,0.2))",
      }}
      aria-label={leaf.name ?? "Lá trang trí"}
    >
      <svg
        viewBox={HEART_VIEWBOX}
        className="h-full w-full"
        aria-hidden
      >
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
          <path
            d={HEART_CLIP_PATH}
            fill={leaf.majorColor}
            opacity={0.6}
          />
        )}
        {/* Viền ngành nhẹ */}
        <path
          d={HEART_CLIP_PATH}
          fill="none"
          stroke={leaf.majorColor}
          strokeWidth={0.6}
          opacity={0.85}
        />
      </svg>
      {leaf.blossom && (
        <span className="absolute -right-1 -top-1 text-lg">🌸</span>
      )}
    </button>
  );
}

function FillerLeaf({
  leaf,
  canvasW,
  canvasH,
  baseSize,
}: {
  leaf: TreeLeaf;
  canvasW: number;
  canvasH: number;
  baseSize: number;
}) {
  const size = baseSize * leaf.scale * 0.85;
  const left = leaf.x * canvasW - size / 2;
  const top = leaf.y * canvasH - size / 2;

  return (
    <div
      className="absolute pointer-events-none opacity-50"
      style={{
        left,
        top,
        width: size,
        height: size,
        transform: `rotate(${leaf.rotation}deg)`,
      }}
    >
      <svg viewBox={HEART_VIEWBOX} className="h-full w-full">
        <path d={HEART_CLIP_PATH} fill={leaf.majorColor} opacity={0.35} />
      </svg>
    </div>
  );
}
