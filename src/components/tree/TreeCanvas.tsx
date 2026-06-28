"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
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
  const dragging = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const { width: W, height: H } = layout.dimensions;
  const baseLeafSize = mode === "mini" ? 28 : presentation ? 62 : 56;
  const skyVariant = presentation ? "twilight" : "tree";

  const photoLeaves = useMemo(
    () =>
      layout.leaves
        .filter((l) => !l.filler && !l.fallen)
        .sort((a, b) => a.y - b.y),
    [layout.leaves]
  );

  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (mode === "mini") return;
      e.preventDefault();
      setScale((s) => Math.min(3, Math.max(0.35, s - e.deltaY * 0.001)));
    },
    [mode]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (mode === "mini") return;
    dragging.current = true;
    lastPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || mode === "mini") return;
    setPan({
      x: e.clientX - lastPan.current.x,
      y: e.clientY - lastPan.current.y,
    });
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    if (mode === "mini" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const fitScale = Math.min(rect.width / W, rect.height / H) * 0.95;
    setScale(fitScale);
    setPan({
      x: (rect.width - W * fitScale) / 2,
      y: (rect.height - H * fitScale) / 2,
    });
  }, [W, H, mode]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onWheel={onWheel}
      style={{ touchAction: mode === "mini" ? "auto" : "none" }}
    >
      <MagicalSkyBackground variant={skyVariant} className="z-0" />

      {(presentation || mode === "view") && <WindFireflies vivid={presentation} />}

      <div
        className="relative z-[2] origin-top-left"
        style={{
          width: W,
          height: H,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          filter: presentation ? "drop-shadow(0 28px 70px rgba(0,0,0,0.4))" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Cây thống nhất: đất + rễ + thân + nhánh + tán xanh */}
        <MightyTreeArt
          width={W}
          height={H}
          rootsText={layout.roots.text}
          presentation={presentation}
        />

        {/* Ảnh sinh viên — gắn TRÊN tán, phía trước */}
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

      {mode !== "mini" && !presentation && (
        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            className="rounded-full border border-white/30 bg-white/25 px-3 py-1.5 text-sm font-bold text-brand-navy shadow-lg backdrop-blur-md"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
            className="rounded-full border border-white/30 bg-white/25 px-3 py-1.5 text-sm font-bold text-brand-navy shadow-lg backdrop-blur-md"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}

function WindFireflies({ vivid }: { vivid?: boolean }) {
  const count = vivid ? 14 : 10;
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${8 + (i * 8) % 84}%`,
            top: `${6 + (i * 10) % 50}%`,
            width: 2,
            height: 2,
            background: i % 3 === 0 ? "#FFD15C" : "#fff",
            boxShadow: `0 0 6px ${i % 3 === 0 ? "#FFAE3B" : "#fff"}`,
          }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.2, 0.85, 0.2],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.25,
          }}
        />
      ))}
    </div>
  );
}
