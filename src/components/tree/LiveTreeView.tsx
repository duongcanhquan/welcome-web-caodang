"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { TreeLayout, TreeLeaf } from "@/lib/tree/types";
import { TreeCanvas } from "./TreeCanvas";
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
}: LiveTreeViewProps) {
  const [layout, setLayout] = useState(initialLayout);
  const [newLeafId, setNewLeafId] = useState<string | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(initialLayout.totalSubmissions);
  const [toast, setToast] = useState<string | null>(null);
  const [blossom, setBlossom] = useState(false);

  const refreshLayout = useCallback(async () => {
    const res = await fetch(`/api/tree/${eventSlug}`);
    if (!res.ok) return;
    const data = (await res.json()) as { layout: TreeLayout };
    setLayout(data.layout);
    setTotalLeaves(data.layout.totalSubmissions);
  }, [eventSlug]);

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
          const row = payload.new as { id: string; name?: string; major?: string };
          setNewLeafId(row.id);
          setTimeout(() => setNewLeafId(null), 2000);

          // Debounce layout refresh — tránh storm khi đông SV nộp cùng lúc
          if (refreshTimer) clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            void refreshLayout();
          }, 800);

          setTotalLeaves((prev) => {
            const newTotal = prev + 1;
            if (newTotal % blossomEvery === 0) {
              setBlossom(true);
              setToast(`🌸 ${newTotal} lá — Nở hoa rồi!`);
              confetti({ particleCount: 80, spread: 100, colors: ["#FF6FA5", "#FFD15C"] });
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
    <div className={`flex flex-col ${fullscreen ? "h-dvh min-h-screen" : "min-h-[70vh]"}`}>
      {!fullscreen && (
        <header className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0 space-y-1">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-peach">
              Trình chiếu trực tiếp
            </p>
            <EventCohortBadge
              batchLabel={batchLabel}
              classLabel={classLabel}
              name={eventName}
              slug={eventSlug}
              size="sm"
            />
            <p className="text-2xl font-bold text-foreground">
              {totalLeaves} lá 🌿
            </p>
          </div>
          <a
            href={`/live/${eventSlug}?present=1`}
            target="_blank"
            className="shrink-0 rounded-button bg-foreground px-4 py-2 text-sm font-semibold text-white"
          >
            Toàn màn hình
          </a>
        </header>
      )}

      <TreeCanvas
        layout={layout}
        mode="live"
        presentation={fullscreen}
        newLeafId={newLeafId}
        className={`flex-1 ${fullscreen ? "h-full" : "min-h-[60vh] rounded-card mx-4"}`}
      />

      {blossom && fullscreen && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
          <p className="font-display animate-bounce text-6xl font-black text-honey drop-shadow-lg">
            🌸 Nở hoa!
          </p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 rounded-button bg-peach px-6 py-3 text-lg font-bold text-white shadow-sticker animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}
