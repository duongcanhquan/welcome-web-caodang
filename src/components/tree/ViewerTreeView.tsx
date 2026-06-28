"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
import { MagicalSkyBackground } from "@/components/motion/MagicalSkyBackground";
import { TreeCanvas } from "./TreeCanvas";
import { LeafDetailCard } from "./LeafDetailCard";

interface ViewerTreeViewProps {
  eventSlug: string;
  layout: TreeLayout;
  presentation?: boolean;
  highlightId?: string | null;
  dobMap?: Record<string, string>;
}

export function ViewerTreeView({
  layout,
  presentation = false,
  highlightId = null,
  dobMap = {},
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
      <div className="relative h-screen overflow-hidden">
        <TreeCanvas
          layout={layout}
          mode="view"
          presentation
          highlightedId={highlightedId}
          onLeafClick={setSelectedLeaf}
          className="h-full"
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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <MagicalSkyBackground variant="tree" className="fixed inset-0 -z-10" />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 border-b border-white/20 bg-white/15 px-4 py-5 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-lg text-center">
          <motion.h1
            className="font-display text-2xl font-bold text-white drop-shadow-lg sm:text-3xl"
            animate={{
              textShadow: [
                "0 2px 20px rgba(255,209,92,0.4)",
                "0 2px 30px rgba(61,190,139,0.5)",
                "0 2px 20px rgba(255,209,92,0.4)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✨ Điều Kỳ Diệu — Cây Khóa 2026
          </motion.h1>
          <p className="mt-2 text-sm font-medium text-white/85">
            {layout.totalSubmissions} sinh viên · Gõ tên để tìm lá của bạn
          </p>
        </div>

        <div className="mx-auto mt-4 flex max-w-md gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && findByName()}
            placeholder="Nhập tên của bạn..."
            className="flex-1 rounded-2xl border-2 border-white/30 bg-white/25 px-4 py-3 text-foreground placeholder:text-ink-muted backdrop-blur-md focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/30"
          />
          <motion.button
            type="button"
            onClick={findByName}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="glow-border rounded-button bg-peach px-5 py-3 font-bold text-white shadow-sticker"
          >
            Tìm ✨
          </motion.button>
        </div>

        <div className="mt-3 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-white/70 underline-offset-2 hover:text-white hover:underline"
          >
            ← Về trang chủ
          </Link>
        </div>
      </motion.header>

      <TreeCanvas
        layout={layout}
        mode="view"
        highlightedId={highlightedId}
        onLeafClick={setSelectedLeaf}
        className="min-h-[68vh] flex-1"
      />

      {showFirefly && highlightedId && <FireflyOverlay />}

      {selectedLeaf && (
        <LeafDetailCard
          leaf={selectedLeaf}
          dob={selectedLeaf.submissionId ? dobMap[selectedLeaf.submissionId] : undefined}
          onClose={() => setSelectedLeaf(null)}
        />
      )}

      <motion.div
        className="fixed bottom-5 right-5 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link
          href="?present=1"
          className="glow-border inline-block rounded-button bg-brand-navy/90 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-md"
        >
          Trình chiếu 🎬
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
