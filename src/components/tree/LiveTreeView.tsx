"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
import { TreeCanvas } from "./TreeCanvas";
import { LeafDetailCard } from "./LeafDetailCard";
import { EventCohortBadge } from "@/components/events/EventCohortBadge";
import { tryCreateClient } from "@/lib/supabase/client";

interface LiveTreeViewProps {
  eventSlug: string;
  eventId: string;
  eventName?: string;
  batchLabel?: string;
  classLabel?: string;
  initialLayout: TreeLayout;
  blossomEvery: number;
  fullscreen?: boolean;
  dobMap?: Record<string, string>;
}

export function LiveTreeView({
  eventSlug,
  eventId,
  eventName,
  batchLabel,
  classLabel,
  initialLayout,
  blossomEvery,
  fullscreen = false,
  dobMap = {},
}: LiveTreeViewProps) {
  const [layout, setLayout] = useState(initialLayout);
  const [newLeafId, setNewLeafId] = useState<string | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(initialLayout.totalSubmissions);
  const [toast, setToast] = useState<string | null>(null);
  const [blossom, setBlossom] = useState(false);
  const [selectedLeaf, setSelectedLeaf] = useState<TreeLeaf | null>(null);
  const [dobs, setDobs] = useState(dobMap);

  const refreshLayout = useCallback(async () => {
    const res = await fetch(`/api/tree/${eventSlug}`);
    if (!res.ok) return;
    const data = (await res.json()) as { layout: TreeLayout };
    setLayout(data.layout);
    setTotalLeaves(data.layout.totalSubmissions);
  }, [eventSlug]);

  useEffect(() => {
    setDobs(dobMap);
  }, [dobMap]);

  useEffect(() => {
    const supabase = tryCreateClient();
    if (!supabase) return;

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel(`tree-live-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            name?: string;
            major?: string;
            dob?: string;
          };
          setNewLeafId(row.id);
          setTimeout(() => setNewLeafId(null), 2000);

          if (row.dob) {
            setDobs((prev) => ({ ...prev, [row.id]: row.dob! }));
          }

          if (refreshTimer) clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            void refreshLayout();
          }, 800);

          setTotalLeaves((prev) => {
            const newTotal = prev + 1;
            if (newTotal % blossomEvery === 0) {
              setBlossom(true);
              setToast(`🌸 ${newTotal} lá — Nở hoa rồi!`);
              confetti({
                particleCount: 80,
                spread: 100,
                colors: ["#FF6FA5", "#FFD15C"],
              });
              setTimeout(() => setBlossom(false), 5000);
            } else {
              setToast(
                row.major
                  ? `Vừa có bạn ngành ${row.major} mọc lá! 🌿`
                  : `${row.name ?? "Một bạn"} vừa gửi lá mới!`
              );
            }
            setTimeout(() => setToast(null), 4000);
            return newTotal;
          });
        }
      )
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [eventId, eventSlug, refreshLayout, blossomEvery]);

  return (
    <div className="relative h-dvh max-h-dvh w-full overflow-hidden">
      {/* Cây full màn hình — header phủ lên trên */}
      <TreeCanvas
        layout={layout}
        mode="live"
        presentation={fullscreen}
        newLeafId={newLeafId}
        onLeafClick={setSelectedLeaf}
        className="absolute inset-0 h-full w-full"
      />

      {!fullscreen && (
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 bg-gradient-to-b from-black/45 via-black/20 to-transparent px-4 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="pointer-events-auto min-w-0 space-y-0.5">
            <p className="font-display text-[11px] font-semibold uppercase tracking-widest text-honey">
              Live · {totalLeaves} lá
            </p>
            <EventCohortBadge
              batchLabel={batchLabel}
              classLabel={classLabel}
              name={eventName}
              slug={eventSlug}
              size="sm"
            />
          </div>
          <a
            href={`/live/${eventSlug}?present=1`}
            className="pointer-events-auto shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-navy shadow-md backdrop-blur-sm"
          >
            Full
          </a>
        </header>
      )}

      {totalLeaves === 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
          <p className="max-w-sm rounded-2xl bg-black/55 px-5 py-4 text-center text-base font-semibold text-white backdrop-blur-sm">
            Cây đã sẵn sàng — chưa có ảnh nào được nộp cho đợt này.
            <br />
            <span className="mt-1 block text-sm font-normal opacity-90">
              Mở form join của đúng slug đợt đang quản lý để sinh viên gửi ảnh.
            </span>
          </p>
        </div>
      )}

      {selectedLeaf && (
        <LeafDetailCard
          leaf={selectedLeaf}
          dob={
            selectedLeaf.submissionId
              ? dobs[selectedLeaf.submissionId]
              : undefined
          }
          onClose={() => setSelectedLeaf(null)}
        />
      )}

      {blossom && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <p className="font-display animate-bounce text-5xl font-black text-honey drop-shadow-lg sm:text-6xl">
            🌸 Nở hoa!
          </p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 rounded-button bg-peach px-5 py-2.5 text-base font-bold text-white shadow-sticker">
          {toast}
        </div>
      )}
    </div>
  );
}
