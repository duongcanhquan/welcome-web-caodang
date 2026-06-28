"use client";

import { useCallback, useEffect, useRef, useState, type WheelEvent } from "react";
import { motion } from "motion/react";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
import { MagicalSkyBackground } from "@/components/motion/MagicalSkyBackground";
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
  const [scale, setScale] = useState(mode === "mini" ? 0.35 : 1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const { width: W, height: H } = layout.dimensions;
  const baseLeafSize = mode === "mini" ? 32 : presentation ? 56 : 52;

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
    const fitScale = Math.min(rect.width / W, rect.height / H) * 0.88;
    setScale(fitScale);
    setPan({
      x: (rect.width - W * fitScale) / 2,
      y: (rect.height - H * fitScale) / 2,
    });
  }, [W, H, mode]);

  const realLeaves = layout.leaves.filter((l) => !l.filler || l.leafUrl);
  const skyVariant = presentation ? "twilight" : "tree";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onWheel={onWheel}
      style={{ touchAction: mode === "mini" ? "auto" : "none" }}
    >
      <MagicalSkyBackground variant={skyVariant} className="z-0" />

      {/* God rays */}
      {!presentation && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-25"
          style={{
            background:
              "conic-gradient(from 200deg at 70% 10%, transparent 0deg, rgba(255,255,255,0.15) 20deg, transparent 50deg)",
          }}
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {(presentation || mode === "view") && <WindFireflies vivid={presentation} />}

      <div
        className="relative z-[2] origin-top-left"
        style={{
          width: W,
          height: H,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          filter: presentation ? "drop-shadow(0 20px 60px rgba(0,0,0,0.4))" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Tree shadow on ground */}
        <div
          className="absolute rounded-[50%] opacity-30 blur-2xl"
          style={{
            left: layout.trunk.x * W - layout.trunk.w * W * 0.8,
            top: (layout.trunk.y + layout.trunk.h) * H - 20,
            width: layout.trunk.w * W * 2.6,
            height: 48,
            background: "radial-gradient(ellipse, #1a3020 0%, transparent 70%)",
          }}
        />

        {/* Thân cây — 3D gradient */}
        <motion.div
          className="absolute rounded-b-3xl"
          style={{
            left: layout.trunk.x * W,
            top: layout.trunk.y * H,
            width: layout.trunk.w * W,
            height: layout.trunk.h * H,
            background: `linear-gradient(90deg, ${shade(layout.trunk.color, -35)} 0%, ${layout.trunk.color} 35%, ${shade(layout.trunk.color, 25)} 50%, ${layout.trunk.color} 65%, ${shade(layout.trunk.color, -35)} 100%)`,
            boxShadow: presentation
              ? `0 0 50px ${layout.trunk.color}88, inset -8px 0 20px rgba(0,0,0,0.2)`
              : `0 8px 32px rgba(26,48,32,0.35), inset -6px 0 16px rgba(0,0,0,0.15)`,
          }}
          animate={
            presentation
              ? { scaleY: [1, 1.008, 1] }
              : { boxShadow: ["0 8px 32px rgba(26,48,32,0.35)", "0 12px 40px rgba(61,190,139,0.25)", "0 8px 32px rgba(26,48,32,0.35)"] }
          }
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Tán cây glow */}
        <div
          className="pointer-events-none absolute rounded-full opacity-20 blur-3xl"
          style={{
            left: W * 0.15,
            top: H * 0.05,
            width: W * 0.7,
            height: H * 0.45,
            background:
              "radial-gradient(circle, rgba(61,190,139,0.6) 0%, rgba(255,209,92,0.2) 50%, transparent 70%)",
          }}
        />

        <p
          className={`absolute w-full text-center font-display text-sm font-bold tracking-wide drop-shadow-md ${
            presentation ? "text-honey/95" : "text-white/90"
          }`}
          style={{ top: layout.roots.y * H }}
        >
          {layout.roots.text}
        </p>

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
            swayDelay={i * 0.08}
            onClick={onLeafClick}
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
  const count = vivid ? 20 : 14;
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${8 + (i * 6.5) % 85}%`,
            top: `${12 + (i * 9) % 75}%`,
            width: vivid ? 3 : 2,
            height: vivid ? 3 : 2,
            background: i % 3 === 0 ? "#FFD15C" : "#fff",
            boxShadow: `0 0 ${vivid ? 8 : 5}px ${i % 3 === 0 ? "#FFAE3B" : "#fff"}`,
          }}
          animate={{
            y: [0, -12, 0],
            x: [0, (i % 2 === 0 ? 8 : -8), 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
