"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
import { TreeCanvas } from "./TreeCanvas";
import { LeafDetailCard } from "./LeafDetailCard";

interface ViewerTreeViewProps {
  eventSlug: string;
  layout: TreeLayout;
  presentation?: boolean;
  highlightId?: string | null;
  dobMap?: Record<string, string>;
  demoBanner?: boolean;
}

export function ViewerTreeView({
  layout,
  presentation = false,
  highlightId = null,
  dobMap = {},
  demoBanner = false,
}: ViewerTreeViewProps) {
  const [search, setSearch] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightId);
  const [selectedLeaf, setSelectedLeaf] = useState<TreeLeaf | null>(null);
  const [showFirefly, setShowFirefly] = useState(Boolean(highlightId));

  useEffect(() => {
    if (highlightId) {
      setHighlightedId(highlightId);
      setShowFirefly(true);
      const leaf = layout.leaves.find((l) => l.id === highlightId);
      if (leaf) {
        setTimeout(() => setSelectedLeaf(leaf), 800);
      }
      setTimeout(() => setShowFirefly(false), 2500);
    }
  }, [highlightId, layout.leaves]);

  const searchable = useMemo(
    () => layout.leaves.filter((l) => l.submissionId && l.name && !l.filler),
    [layout.leaves]
  );

  const findByName = useCallback(() => {
    const q = search.trim().toLowerCase();
    if (!q) return;

    const match = searchable.find((l) => l.name!.toLowerCase().includes(q));

    if (match) {
      setHighlightedId(match.id);
      setShowFirefly(true);
      setTimeout(() => setShowFirefly(false), 2500);
      setTimeout(() => setSelectedLeaf(match), 800);
    }
  }, [search, searchable]);

  if (presentation) {
    return (
      <div className="relative h-dvh max-h-dvh w-full overflow-hidden">
        <TreeCanvas
          layout={layout}
          mode="view"
          presentation
          highlightedId={highlightedId}
          onLeafClick={setSelectedLeaf}
          className="absolute inset-0 h-full w-full"
        />
        {selectedLeaf && (
          <LeafDetailCard
            leaf={selectedLeaf}
            dob={selectedLeaf.submissionId ? dobMap[selectedLeaf.submissionId] : undefined}
            onClose={() => setSelectedLeaf(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden">
      {demoBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-30 shrink-0 border-b border-honey/30 bg-honey/20 px-4 py-2 text-center text-sm font-semibold text-brand-navy backdrop-blur-md"
        >
          🎬 Demo xem trước — {layout.totalSubmissions} lá mẫu · Không phải dữ liệu thật
        </motion.div>
      )}

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-30 shrink-0 border-b border-white/20 bg-black/25 px-4 py-3 backdrop-blur-xl sm:py-5"
      >
        <div className="mx-auto max-w-lg text-center">
          <motion.h1
            className="font-display text-xl font-bold text-white drop-shadow-lg sm:text-3xl"
            animate={{
              textShadow: [
                "0 2px 20px rgba(255,209,92,0.4)",
                "0 2px 30px rgba(61,190,139,0.5)",
                "0 2px 20px rgba(255,209,92,0.4)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✨ Điều Kỳ Diệu — WELCOME NEW LYONS
          </motion.h1>
          <p className="mt-1 text-xs font-medium text-white/85 sm:mt-2 sm:text-sm">
            {layout.totalSubmissions} sinh viên · Bấm ảnh xem chi tiết · Gõ tên để tìm
          </p>
        </div>

        <div className="mx-auto mt-3 flex max-w-md gap-2 sm:mt-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && findByName()}
            placeholder="Nhập tên của bạn..."
            className="flex-1 rounded-2xl border-2 border-white/30 bg-white/25 px-4 py-2.5 text-sm text-foreground placeholder:text-ink-muted backdrop-blur-md focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/30 sm:py-3 sm:text-base"
          />
          <motion.button
            type="button"
            onClick={findByName}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="glow-border rounded-button bg-peach px-4 py-2.5 text-sm font-bold text-white shadow-sticker sm:px-5 sm:py-3 sm:text-base"
          >
            Tìm ✨
          </motion.button>
        </div>

        <div className="mt-2 text-center sm:mt-3">
          <Link
            href="/"
            className="text-xs font-semibold text-white/70 underline-offset-2 hover:text-white hover:underline"
          >
            ← Về trang chủ
          </Link>
        </div>
      </motion.header>

      <div className="relative min-h-0 flex-1">
        <TreeCanvas
          layout={layout}
          mode="view"
          highlightedId={highlightedId}
          onLeafClick={setSelectedLeaf}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {showFirefly && highlightedId && <FireflyOverlay />}

      {selectedLeaf && (
        <LeafDetailCard
          leaf={selectedLeaf}
          dob={selectedLeaf.submissionId ? dobMap[selectedLeaf.submissionId] : undefined}
          onClose={() => setSelectedLeaf(null)}
        />
      )}

      <motion.div
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-20 sm:bottom-5 sm:right-5"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link
          href="?present=1"
          className="glow-border inline-block rounded-button bg-brand-navy/90 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-md sm:px-5 sm:py-2.5"
        >
          Full màn hình 🎬
        </Link>
      </motion.div>
    </div>
  );
}

function FireflyOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
      <motion.span
        className="text-5xl"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.8, 1.2], opacity: [0, 1, 0] }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        ✨
      </motion.span>
    </div>
  );
}
