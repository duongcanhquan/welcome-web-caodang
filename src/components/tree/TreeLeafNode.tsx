"use client";

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
  /** Ảnh tròn gắn trên tán cây (không phải hình trái tim) */
  onBranch?: boolean;
}

export function TreeLeafNode({
  leaf,
  canvasW,
  canvasH,
  baseSize = 56,
  highlighted = false,
  isNew = false,
  presentation = false,
  windSway = false,
  swayDelay = 0,
  onClick,
  onBranch = false,
}: TreeLeafNodeProps) {
  if (leaf.filler && !leaf.leafUrl) return null;

  const size = baseSize * leaf.scale;
  const left = leaf.x * canvasW - size / 2;
  const top = leaf.y * canvasH - size / 2;
  const clickable = !leaf.filler && Boolean(leaf.submissionId);
  const isFallen = leaf.fallen;
  const swayClass = windSway || presentation ? "animate-leaf-wind" : "";

  if (onBranch && leaf.leafUrl) {
    return (
      <button
        type="button"
        disabled={!clickable}
        onClick={() => clickable && onClick?.(leaf)}
        className={`absolute origin-center transition-all duration-500 ${swayClass} ${
          clickable ? "cursor-pointer hover:z-[25] hover:scale-110" : "pointer-events-none"
        } ${isNew ? "animate-leaf-pop" : ""} ${
          highlighted ? "z-[30] !scale-[1.3]" : "z-[10]"
        }`}
        style={{
          left,
          top,
          width: size,
          height: size,
          ["--leaf-rot" as string]: `${leaf.rotation}deg`,
          animationDelay: `${swayDelay}s`,
        }}
        aria-label={leaf.name ?? "Sinh viên"}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotate(${leaf.rotation}deg)`,
            filter: highlighted
              ? "drop-shadow(0 0 20px #FFD15C) drop-shadow(0 6px 12px rgba(0,0,0,0.45))"
              : "drop-shadow(0 4px 10px rgba(0,0,0,0.4))",
          }}
        >
          {/* Viền trắng + viền màu ngành — như ảnh ghim trên tán */}
          <div
            className="h-full w-full overflow-hidden rounded-full p-[3px]"
            style={{
              background: highlighted
                ? "linear-gradient(135deg, #FFD15C, #FFAE3B)"
                : `linear-gradient(135deg, #fff 0%, ${leaf.majorColor} 100%)`,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.9)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={leaf.leafUrl}
              alt={leaf.name ?? ""}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          {leaf.blossom && (
            <span className="absolute -right-0.5 -top-0.5 text-base">🌸</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onClick?.(leaf)}
      className={`absolute origin-center transition-all duration-500 ${swayClass} ${
        clickable ? "cursor-pointer hover:z-20 hover:scale-110" : "cursor-default pointer-events-none"
      } ${isNew ? "animate-leaf-pop" : ""} ${
        highlighted ? "z-30 !scale-[1.35]" : isFallen ? "z-[4] opacity-80" : "z-[5]"
      }`}
      style={{
        left,
        top,
        width: size,
        height: size,
        ["--leaf-rot" as string]: `${leaf.rotation}deg`,
        animationDelay: `${swayDelay}s`,
        filter: highlighted
          ? "drop-shadow(0 0 16px #FFD15C)"
          : "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
      }}
      aria-label={leaf.name ?? "Lá"}
    >
      <div
        className="h-full w-full overflow-hidden rounded-full ring-2 ring-white/80"
        style={{ transform: `rotate(${leaf.rotation}deg)` }}
      >
        {leaf.leafUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={leaf.leafUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full rounded-full" style={{ background: leaf.majorColor }} />
        )}
      </div>
    </button>
  );
}
