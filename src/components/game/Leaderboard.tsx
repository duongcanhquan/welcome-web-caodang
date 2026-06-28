"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

interface LeaderboardProps {
  eventId: string;
}

export function Leaderboard({ eventId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const fetchBoard = async () => {
    const res = await fetch(`/api/game/flappy?eventId=${eventId}`);
    const data = (await res.json()) as { leaderboard: LeaderboardEntry[] };
    setEntries(data.leaderboard ?? []);
  };

  useEffect(() => {
    fetchBoard();

    const supabase = createClient();
    const channel = supabase
      .channel(`flappy-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_scores",
          filter: `event_id=eq.${eventId}`,
        },
        () => fetchBoard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (entries.length === 0) {
    return (
      <motion.p
        className="text-center text-sm text-ink-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Chưa có điểm — hãy là người đầu tiên! 🏆
      </motion.p>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((e, i) => (
        <motion.li
          key={e.rank}
          className="flex items-center justify-between rounded-card bg-surface-warm px-4 py-2.5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.02, backgroundColor: "color-mix(in srgb, var(--honey) 20%, var(--surface-warm))" }}
          layout
        >
          <span className="flex items-center gap-2">
            <motion.span
              className="font-display w-6 text-lg font-bold text-peach"
              animate={e.rank === 1 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: e.rank === 1 ? Infinity : 0 }}
            >
              {e.rank}
            </motion.span>
            <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
              {e.name}
            </span>
          </span>
          <span className="font-display font-bold text-sprout">{e.score}</span>
        </motion.li>
      ))}
    </ol>
  );
}
