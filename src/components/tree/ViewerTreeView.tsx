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

  return (
    <div className="relative h-dvh max-h-dvh w-full overflow-hidden">
      {/* Cây full viewport — UI phủ lên; camera tự contain (desktop) / cover (mobile) */}
      <TreeCanvas
        layout={layout}
        mode="view"
        presentation={presentation}
        highlightedId={highlightedId}
        onLeafClick={setSelectedLeaf}
        className="absolute inset-0 h-full w-full"
      />

      {demoBanner && !presentation && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <p className="rounded-full bg-honey/90 px-3 py-1 text-center text-xs font-semibold text-brand-navy shadow-md">
            Demo · {layout.totalSubmissions} lá mẫu
          </p>
        </div>
      )}

      {!presentation && (
        <>
          <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
            <div
              className={`pointer-events-auto mx-auto max-w-lg rounded-2xl bg-black/45 px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3 ${
                demoBanner ? "mt-8" : ""
              }`}
            >
              <h1 className="font-display text-center text-sm font-bold text-white drop-shadow sm:text-lg">
                Điều Kỳ Diệu — WELCOME NEW LYONS
              </h1>
              <p className="mt-0.5 text-center text-[11px] font-medium text-white/80 sm:text-xs">
                {layout.totalSubmissions} sinh viên · Bấm ảnh · Gõ tên để tìm
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && findByName()}
                  placeholder="Nhập tên của bạn..."
                  className="min-w-0 flex-1 rounded-xl border border-white/25 bg-white/20 px-3 py-2 text-sm text-white placeholder:text-white/55 focus:border-honey focus:outline-none focus:ring-1 focus:ring-honey/40"
                />
                <button
                  type="button"
                  onClick={findByName}
                  className="shrink-0 rounded-xl bg-peach px-3 py-2 text-sm font-bold text-white shadow-sm"
                >
                  Tìm
                </button>
              </div>
              <div className="mt-1.5 text-center">
                <Link
                  href="/"
                  className="text-[11px] font-semibold text-white/65 underline-offset-2 hover:text-white hover:underline"
                >
                  ← Về trang chủ
                </Link>
              </div>
            </div>
          </header>

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
              Full màn hình
            </Link>
          </motion.div>
        </>
      )}

      {showFirefly && highlightedId && <FireflyOverlay />}

      {selectedLeaf && (
        <LeafDetailCard
          leaf={selectedLeaf}
          dob={
            selectedLeaf.submissionId
              ? dobMap[selectedLeaf.submissionId]
              : undefined
          }
          onClose={() => setSelectedLeaf(null)}
        />
      )}
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
