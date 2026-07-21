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
 * Cây full khung. Click lá chỉ qua hit-test pointer (tránh double-fire
 * pointerup + click làm đóng thẻ chi tiết ngay).
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
  const cameraRef = useRef({ scale: 1, panX: 0, panY: 0 });
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const { width: W, height: H } = layout.dimensions;
  const baseLeafSize = mode === "mini" ? 28 : presentation ? 58 : 52;
  const skyVariant = presentation ? "twilight" : "tree";

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
    const vh = rect.height;
    if (vw < 8 || vh < 8) return;

    const scaleW = vw / W;
    const scaleH = vh / H;
    const portrait = vh / vw >= 1.05;
    const narrow = vw < 768;
    // Cover trên mobile; thiên về giữ tán (ảnh) trong khung — không neo đáy quá mạnh
    const useCover = portrait || narrow || presentation;
    const fitScale = useCover
      ? Math.max(scaleW, scaleH)
      : Math.min(scaleW, scaleH);

    const panX = (vw - W * fitScale) / 2;
    // Cover: căn giữa theo chiều dọc một chút về phía tán (ảnh ở nửa trên)
    let panY: number;
    if (useCover) {
      const overflow = H * fitScale - vh;
      panY = overflow > 0 ? -overflow * 0.35 : (vh - H * fitScale) / 2;
    } else {
      panY = vh - H * fitScale;
    }

    cameraRef.current = { scale: fitScale, panX, panY };
    setScale(fitScale);
    setPan({ x: panX, y: panY });
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
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", fitToViewport);
      window.visualViewport?.removeEventListener("resize", fitToViewport);
    };
  }, [fitToViewport, mode]);

  const pickLeafAtClient = useCallback(
    (clientX: number, clientY: number): TreeLeaf | null => {
      const el = containerRef.current;
      if (!el || !onLeafClick) return null;
      const rect = el.getBoundingClientRect();
      const { scale: s, panX, panY } = cameraRef.current;
      if (s <= 0) return null;

      const canvasX = (clientX - rect.left - panX) / s;
      const canvasY = (clientY - rect.top - panY) / s;

      let best: TreeLeaf | null = null;
      let bestDist = Infinity;

      for (const leaf of photoLeaves) {
        if (!leaf.submissionId) continue;
        const cx = leaf.x * W;
        const cy = leaf.y * H;
        const radius = (baseLeafSize * leaf.scale) / 2;
        const dist = Math.hypot(canvasX - cx, canvasY - cy);
        if (dist <= radius * 1.4 && dist < bestDist) {
          best = leaf;
          bestDist = dist;
        }
      }
      return best;
    },
    [W, H, baseLeafSize, photoLeaves, onLeafClick]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      pointerDownRef.current = { x: e.clientX, y: e.clientY };
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!onLeafClick || e.button !== 0) return;
      const down = pointerDownRef.current;
      pointerDownRef.current = null;
      if (!down) return;
      // Bỏ qua nếu kéo tay (không phải tap)
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) return;

      const leaf = pickLeafAtClient(e.clientX, e.clientY);
      if (leaf) {
        e.preventDefault();
        e.stopPropagation();
        onLeafClick(leaf);
      }
    },
    [onLeafClick, pickLeafAtClient]
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ touchAction: "manipulation" }}
      onPointerDown={mode === "mini" ? undefined : handlePointerDown}
      onPointerUp={mode === "mini" ? undefined : handlePointerUp}
    >
      <MagicalSkyBackground variant={skyVariant} className="z-0" />

      {(presentation || mode === "view" || mode === "live") && (
        <WindFireflies vivid={presentation} />
      )}

      <div
        className="pointer-events-none relative z-[2] origin-top-left will-change-transform"
        style={{
          width: W,
          height: H,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          filter: presentation
            ? "drop-shadow(0 24px 60px rgba(0,0,0,0.35))"
            : undefined,
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
              // Click xử lý ở canvas — tránh double-fire đóng thẻ
              interactive={false}
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
