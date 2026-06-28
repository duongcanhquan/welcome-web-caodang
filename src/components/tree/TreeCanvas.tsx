"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
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
  const baseLeafSize = mode === "mini" ? 32 : presentation ? 56 : 48;

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

  // Fit to container on mount
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

  const realLeaves = layout.leaves.filter((l) => !l.filler || l.leafUrl);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${presentation ? "bg-[#0a1628]" : "bg-gradient-to-b from-sky-100/40 to-surface-warm"} ${className}`}
      onWheel={onWheel}
      style={{ touchAction: mode === "mini" ? "auto" : "none" }}
    >
      {/* Đom đóm trình chiếu */}
      {presentation && <Fireflies />}

      <div
        className="relative origin-top-left"
        style={{
          width: W,
          height: H,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Thân cây */}
        <div
          className="absolute rounded-b-3xl"
          style={{
            left: layout.trunk.x * W,
            top: layout.trunk.y * H,
            width: layout.trunk.w * W,
            height: layout.trunk.h * H,
            background: `linear-gradient(90deg, ${shade(layout.trunk.color, -20)}, ${layout.trunk.color}, ${shade(layout.trunk.color, -20)})`,
            boxShadow: presentation
              ? `0 0 30px ${layout.trunk.color}66`
              : undefined,
          }}
        />

        {/* Rễ — text khắc tên khóa */}
        <p
          className={`absolute w-full text-center font-display text-sm font-bold tracking-wide ${
            presentation ? "text-honey/90" : "text-ink-muted"
          }`}
          style={{ top: layout.roots.y * H }}
        >
          {layout.roots.text}
        </p>

        {/* Lá */}
        {realLeaves.map((leaf) => (
          <TreeLeafNode
            key={leaf.id}
            leaf={leaf}
            canvasW={W}
            canvasH={H}
            baseSize={baseLeafSize}
            highlighted={highlightedId === leaf.id}
            isNew={newLeafId === leaf.id}
            presentation={presentation}
            onClick={onLeafClick}
          />
        ))}
      </div>

      {mode !== "mini" && !presentation && (
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            className="rounded-full bg-surface/90 px-3 py-1 text-sm shadow-soft"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
            className="rounded-full bg-surface/90 px-3 py-1 text-sm shadow-soft"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}

function Fireflies() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-honey animate-firefly"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${15 + (i * 11) % 70}%`,
            animationDelay: `${i * 0.4}s`,
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
