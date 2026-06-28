"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import { motion } from "motion/react";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
import { MagicalSkyBackground } from "@/components/motion/MagicalSkyBackground";
import { TreeGround } from "./TreeGround";
import { TreeTrunkArt } from "./TreeTrunkArt";
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

const DEFAULT_GROUND = { y: 0.74, h: 0.26 };

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
  const [scale, setScale] = useState(mode === "mini" ? 0.35 : 1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const { width: W, height: H } = layout.dimensions;
  const baseLeafSize = mode === "mini" ? 30 : presentation ? 54 : 48;
  const ground = layout.ground ?? DEFAULT_GROUND;
  const skyVariant = presentation ? "twilight" : "tree";

  const realLeaves = useMemo(
    () =>
      layout.leaves
        .filter((l) => !l.filler || l.leafUrl)
        .sort((a, b) => a.y - b.y),
    [layout.leaves]
  );

  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (mode === "mini") return;
      e.preventDefault();
      setScale((s) => Math.min(3, Math.max(0.4, s - e.deltaY * 0.001)));
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
    const fitScale = Math.min(rect.width / W, rect.height / H) * 0.92;
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

      {!presentation && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-20"
          style={{
            background:
              "conic-gradient(from 210deg at 50% 20%, transparent 0deg, rgba(255,255,255,0.12) 18deg, transparent 42deg)",
          }}
          animate={{ rotate: [0, 6, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {(presentation || mode === "view") && <WindFireflies vivid={presentation} />}

      <div
        className="relative z-[2] origin-top-left"
        style={{
          width: W,
          height: H,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          filter: presentation ? "drop-shadow(0 24px 64px rgba(0,0,0,0.35))" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Đất + rễ + nước */}
        <TreeGround
          width={W}
          height={H}
          groundY={ground.y}
          groundH={ground.h}
          rootsText={layout.roots.text}
          presentation={presentation}
        />

        {/* Thân cây */}
        <TreeTrunkArt
          width={W}
          height={H}
          trunk={layout.trunk}
          presentation={presentation}
        />

        {/* Ánh sáng tán — phía sau lá */}
        <div
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{
            left: W * 0.12,
            top: H * 0.08,
            width: W * 0.76,
            height: H * 0.42,
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(61,190,139,0.35) 0%, rgba(255,209,92,0.12) 45%, transparent 72%)",
            opacity: 0.85,
          }}
        />

        {/* Lá = ảnh sinh viên — vòm cây */}
        {realLeaves.map((leaf, i) => (
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
            swayDelay={i * 0.06}
            onClick={onLeafClick}
          />
        ))}

        {/* Bóng đổ gốc cây */}
        <div
          className="pointer-events-none absolute rounded-[50%] opacity-40 blur-xl"
          style={{
            left: W * 0.32,
            top: ground.y * H - 8,
            width: W * 0.36,
            height: 28,
            background: "radial-gradient(ellipse, #1a3020 0%, transparent 70%)",
          }}
        />
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
  const count = vivid ? 18 : 12;
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${8 + (i * 11) % 55}%`,
            width: vivid ? 3 : 2,
            height: vivid ? 3 : 2,
            background: i % 3 === 0 ? "#FFD15C" : "#fff",
            boxShadow: `0 0 ${vivid ? 8 : 5}px ${i % 3 === 0 ? "#FFAE3B" : "#fff"}`,
          }}
          animate={{
            y: [0, -10, 0],
            x: [0, (i % 2 === 0 ? 6 : -6), 0],
            opacity: [0.25, 0.9, 0.25],
          }}
          transition={{
            duration: 3.5 + (i % 4),
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
