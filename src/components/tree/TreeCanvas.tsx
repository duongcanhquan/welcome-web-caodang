"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
import { MagicalSkyBackground } from "@/components/motion/MagicalSkyBackground";
import { MightyTreeArt } from "./MightyTreeArt";
import { TreeLeafNode } from "./TreeLeafNode";

interface TreeCanvasProps {
  layout: TreeLayout;
  mode?: "live" | "view" | "mini";
  presentation?: boolean;
  highlightedId?: string | null;
  newLeafId?: string | null;
  onLeafClick?: (leaf: TreeLeaf) => void;
  className?: string;
}

/**
 * Cây full khung: mobile/portrait = cover (lấp màn hình);
 * desktop ngang = contain, đất neo đáy.
 */
export function TreeCanvas({
  layout,
  mode = "view",
  presentation = false,
  highlightedId = null,
  newLeafId = null,
  onLeafClick,
  className = "",
}: TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(mode === "mini" ? 0.32 : 1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const { width: W, height: H } = layout.dimensions;
  const baseLeafSize = mode === "mini" ? 28 : presentation ? 58 : 52;
  const skyVariant = presentation ? "twilight" : "tree";
  const lockedCamera = mode !== "mini";

  const photoLeaves = useMemo(
    () =>
      layout.leaves
        .filter((l) => !l.filler)
        .sort((a, b) => a.y - b.y),
    [layout.leaves]
  );

  const fitToViewport = useCallback(() => {
    if (mode === "mini" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const vw = rect.width;
    // visualViewport giúp đúng khi thanh địa chỉ mobile ẩn/hiện
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    const vh = Math.max(
      rect.height,
      vv && rect.top < 8 ? vv.height - Math.max(0, rect.top) : 0
    );
    if (vw < 8 || vh < 8) return;

    const scaleW = vw / W;
    const scaleH = vh / H;
    const portrait = vh / vw >= 1.05;
    const narrow = vw < 768;

    // Điện thoại / portrait: cover — cây lấp kín, cắt nhẹ hai bên thay vì để trống trời
    // Desktop ngang: contain — cả cây trong khung
    const useCover = portrait || narrow || presentation;
    const fitScale = useCover
      ? Math.max(scaleW, scaleH)
      : Math.min(scaleW, scaleH);

    setScale(fitScale);
    setPan({
      x: (vw - W * fitScale) / 2,
      // Đất sát đáy; cover có thể cắt đỉnh tán một chút
      y: vh - H * fitScale,
    });
  }, [W, H, mode, presentation]);

  useEffect(() => {
    fitToViewport();
    if (mode === "mini") return;

    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => fitToViewport());
    ro.observe(el);
    window.addEventListener("orientationchange", fitToViewport);
    window.visualViewport?.addEventListener("resize", fitToViewport);
    window.visualViewport?.addEventListener("scroll", fitToViewport);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", fitToViewport);
      window.visualViewport?.removeEventListener("resize", fitToViewport);
      window.visualViewport?.removeEventListener("scroll", fitToViewport);
    };
  }, [fitToViewport, mode]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ touchAction: "manipulation" }}
    >
      <MagicalSkyBackground variant={skyVariant} className="z-0" />

      {(presentation || mode === "view") && (
        <WindFireflies vivid={presentation} />
      )}

      <div
        className="relative z-[2] origin-top-left will-change-transform"
        style={{
          width: W,
          height: H,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          filter: presentation
            ? "drop-shadow(0 24px 60px rgba(0,0,0,0.35))"
            : undefined,
          ...(lockedCamera ? { touchAction: "none" as const } : null),
        }}
      >
        <MightyTreeArt
          width={W}
          height={H}
          rootsText={layout.roots.text}
          presentation={presentation}
        />

        <div className="absolute inset-0 z-[10]">
          {photoLeaves.map((leaf, i) => (
            <TreeLeafNode
              key={leaf.id}
              leaf={leaf}
              canvasW={W}
              canvasH={H}
              baseSize={baseLeafSize}
              highlighted={highlightedId === leaf.id}
              isNew={newLeafId === leaf.id}
              presentation={presentation}
              windSway={mode !== "mini"}
              swayDelay={i * 0.05}
              onClick={onLeafClick}
              onBranch
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WindFireflies({ vivid }: { vivid?: boolean }) {
  const count = vivid ? 12 : 8;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${10 + ((i * 9) % 80)}%`,
            top: `${8 + ((i * 11) % 42)}%`,
            width: 2,
            height: 2,
            background: i % 3 === 0 ? "#FFD15C" : "#fff",
            boxShadow: `0 0 6px ${i % 3 === 0 ? "#FFAE3B" : "#fff"}`,
          }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.15, 0.7, 0.15],
          }}
          transition={{
            duration: 5 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
