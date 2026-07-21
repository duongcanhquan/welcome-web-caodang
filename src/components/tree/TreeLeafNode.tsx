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
  /** false = chỉ hiển thị (click do TreeCanvas hit-test) */
  interactive?: boolean;
  onBranch?: boolean;
}

function imageSrc(leaf: TreeLeaf): string | null {
  return leaf.leafUrl || leaf.photoUrl || null;
}

function initials(name?: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "?";
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
  interactive = true,
  onBranch = false,
}: TreeLeafNodeProps) {
  if (leaf.filler && !imageSrc(leaf)) return null;

  const size = baseSize * leaf.scale;
  const left = leaf.x * canvasW - size / 2;
  const top = leaf.y * canvasH - size / 2;
  const clickable =
    interactive && !leaf.filler && Boolean(leaf.submissionId) && Boolean(onClick);
  const isFallen = leaf.fallen;
  const swayClass = windSway || presentation ? "animate-leaf-wind" : "";
  const src = imageSrc(leaf);
  const tip =
    leaf.name != null
      ? [leaf.name, leaf.major].filter(Boolean).join(" · ")
      : undefined;

  const handleActivate = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    if (clickable) onClick?.(leaf);
  };

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={tip}
      onClick={clickable ? handleActivate : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleActivate(e);
              }
            }
          : undefined
      }
      className={`group absolute origin-center transition-[z-index,transform] duration-300 ${
        clickable
          ? "pointer-events-auto cursor-pointer hover:z-[40] hover:scale-110"
          : "pointer-events-none"
      } ${isNew ? "animate-leaf-pop" : ""} ${
        highlighted
          ? "z-[30] !scale-[1.3]"
          : isFallen
            ? "z-[8] opacity-90"
            : "z-[10]"
      }`}
      style={{
        left,
        top,
        width: size,
        height: size,
      }}
      aria-label={leaf.name ?? (onBranch ? "Sinh viên" : "Lá")}
    >
      {tip && (
        <span
          className="pointer-events-none absolute bottom-[108%] left-1/2 z-50 hidden w-max max-w-[11rem] -translate-x-1/2 rounded-lg bg-brand-navy/95 px-2.5 py-1.5 text-left text-[11px] font-semibold leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 sm:block"
          role="tooltip"
        >
          <span className="block truncate">{leaf.name}</span>
          {leaf.major ? (
            <span className="mt-0.5 block truncate text-[10px] font-normal text-white/80">
              {leaf.major}
            </span>
          ) : null}
        </span>
      )}

      <div
        className={`relative h-full w-full ${swayClass}`}
        style={{
          ["--leaf-rot" as string]: `${leaf.rotation}deg`,
          animationDelay: `${swayDelay}s`,
          filter: highlighted
            ? "drop-shadow(0 0 20px #FFD15C) drop-shadow(0 6px 12px rgba(0,0,0,0.45))"
            : "drop-shadow(0 4px 10px rgba(0,0,0,0.4))",
        }}
      >
        <div
          className="h-full w-full overflow-hidden rounded-full p-[3px]"
          style={{
            background: highlighted
              ? "linear-gradient(135deg, #FFD15C, #FFAE3B)"
              : `linear-gradient(135deg, #fff 0%, ${leaf.majorColor} 100%)`,
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.9)",
          }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={leaf.name ?? ""}
              className="pointer-events-none h-full w-full rounded-full object-cover"
              loading="lazy"
              draggable={false}
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                const fallback = el.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="h-full w-full items-center justify-center rounded-full text-[0.55em] font-bold text-white"
            style={{
              display: src ? "none" : "flex",
              background: leaf.majorColor,
            }}
          >
            {initials(leaf.name)}
          </div>
        </div>
        {leaf.blossom && (
          <span className="absolute -right-0.5 -top-0.5 text-base">🌸</span>
        )}
      </div>
    </div>
  );
}
