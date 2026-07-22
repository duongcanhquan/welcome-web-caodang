"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
import { findLeafByName } from "@/lib/tree/find-leaf";
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
  const [toast, setToast] = useState<string | null>(null);

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
    const match = findLeafByName(searchable, search);
    if (!match) {
      setToast("Không tìm thấy tên này");
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setHighlightedId(match.id);
    setShowFirefly(true);
    setTimeout(() => setShowFirefly(false), 2500);
    setTimeout(() => setSelectedLeaf(match), 500);
  }, [search, searchable]);

  return (
    <div className="relative h-dvh max-h-dvh w-full overflow-hidden">
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
              className={`pointer-events-auto mx-auto max-w-md rounded-2xl bg-black/40 px-3 py-2 text-center backdrop-blur-md ${
                demoBanner ? "mt-8" : ""
              }`}
            >
              <h1 className="font-display text-sm font-bold text-white drop-shadow sm:text-base">
                Điều Kỳ Diệu — WELCOME NEW LYONS
              </h1>
              <p className="mt-0.5 text-[11px] font-medium text-white/80">
                {layout.totalSubmissions} sinh viên · Bấm ảnh xem info
              </p>
              <Link
                href="/"
                className="mt-1 inline-block text-[11px] font-semibold text-white/65 underline-offset-2 hover:text-white hover:underline"
              >
                ← Về trang chủ
              </Link>
            </div>
          </header>

          {/* Ô tìm cạnh gốc cây / nền đất */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/20 bg-black/55 px-3 py-3 shadow-lg backdrop-blur-md sm:px-4">
              <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-honey">
                Tìm lá của bạn trên cây
              </p>
              <div className="flex gap-2">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && findByName()}
                  placeholder="Nhập tên của bạn..."
                  className="min-w-0 flex-1 rounded-xl border border-white/30 bg-white/20 px-3 py-2.5 text-sm text-white placeholder:text-white/55 focus:border-honey focus:outline-none focus:ring-1 focus:ring-honey/40"
                  autoComplete="name"
                  enterKeyHint="search"
                />
                <button
                  type="button"
                  onClick={findByName}
                  className="shrink-0 rounded-xl bg-peach px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                >
                  Tìm
                </button>
              </div>
            </div>
          </motion.div>

          <Link
            href="?present=1"
            className="fixed right-3 top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] z-20 rounded-full bg-brand-navy/85 px-3 py-1.5 text-[11px] font-bold text-white shadow-md backdrop-blur-md sm:right-5"
          >
            Full
          </Link>
        </>
      )}

      {showFirefly && highlightedId && <FireflyOverlay />}

      {toast && (
        <div className="fixed bottom-[max(7.5rem,calc(env(safe-area-inset-bottom)+6.5rem))] left-1/2 z-40 -translate-x-1/2 rounded-button bg-peach px-4 py-2 text-sm font-bold text-white shadow-sticker">
          {toast}
        </div>
      )}

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
