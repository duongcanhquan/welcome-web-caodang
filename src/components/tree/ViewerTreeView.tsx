"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
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

    const match = searchable.find((l) =>
      l.name!.toLowerCase().includes(q)
    );

    if (match) {
      setHighlightedId(match.id);
      setShowFirefly(true);
      setTimeout(() => setShowFirefly(false), 2500);
      setTimeout(() => {
        setSelectedLeaf(match);
      }, 800);
    }
  }, [search, searchable]);

  return (
    <div className={`flex flex-col ${presentation ? "h-screen bg-[#0a1628]" : "min-h-screen"}`}>
      {!presentation && (
        <header className="sticky top-0 z-20 bg-background/95 px-4 py-4 backdrop-blur">
          <h1 className="font-display text-center text-xl font-bold text-foreground">
            Cây Khóa 2026 🌳
          </h1>
          <p className="mt-1 text-center text-sm text-ink-muted">
            {layout.totalSubmissions} sinh viên · Gõ tên để tìm mình
          </p>
          <div className="mx-auto mt-3 flex max-w-md gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && findByName()}
              placeholder="Nhập tên của bạn..."
              className="flex-1 rounded-card border-2 border-peach/30 bg-surface px-4 py-3 focus:border-peach focus:outline-none"
            />
            <button
              type="button"
              onClick={findByName}
              className="rounded-button bg-peach px-5 py-3 font-bold text-white"
            >
              Tìm
            </button>
          </div>
        </header>
      )}

      <TreeCanvas
        layout={layout}
        mode="view"
        presentation={presentation}
        highlightedId={highlightedId}
        onLeafClick={setSelectedLeaf}
        className={`flex-1 ${presentation ? "h-full" : "min-h-[65vh]"}`}
      />

      {showFirefly && highlightedId && (
        <FireflyOverlay />
      )}

      {selectedLeaf && (
        <LeafDetailCard
          leaf={selectedLeaf}
          dob={selectedLeaf.submissionId ? dobMap[selectedLeaf.submissionId] : undefined}
          onClose={() => setSelectedLeaf(null)}
        />
      )}

      {!presentation && (
        <div className="fixed bottom-4 right-4">
          <a
            href="?present=1"
            className="rounded-button bg-foreground px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            Trình chiếu ✨
          </a>
        </div>
      )}
    </div>
  );
}

function FireflyOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
      <span className="animate-firefly-travel text-4xl">✨</span>
    </div>
  );
}
