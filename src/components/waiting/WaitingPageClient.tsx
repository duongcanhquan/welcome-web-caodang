"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NumerologyCard } from "@/components/numerology/NumerologyCard";
import { FlappyBirdGame } from "@/components/game/FlappyBirdGame";
import { Leaderboard } from "@/components/game/Leaderboard";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import { AnimatedButton, FadeIn, GradientText, Stagger, StaggerItem } from "@/components/motion";
import type { TreeLayout } from "@/lib/tree/types";
import type { LifePathContent } from "@/lib/numerology";
import type { NumerologyResult } from "@/lib/numerology";
import { getMajorMatchMessage } from "@/lib/numerology";
import { createClient } from "@/lib/supabase/client";

interface MeData {
  submission: {
    id: string;
    token: string;
    name: string;
    major: string;
    dob: string;
    wish: string;
    slot_index: number | null;
    events: { id: string; slug: string; name: string; status: string };
  };
  insight: {
    numerology: NumerologyResult & { content: LifePathContent };
    ai_numerology: string | null;
    ai_personalization: { wishComment?: string; funFact?: string };
  } | null;
  totalLeaves: number;
}

interface WaitingPageProps {
  token: string;
  initialLeafNumber?: number;
}

const TOASTS = [
  "Sắp nở hoa rồi, đừng đi đâu nhé 👀",
  "Cây đang lớn từng chiếc lá 🌿",
  "Thử chơi Flappy Lá xem ai bay cao nhất! 🍃",
  "Chia sẻ thần số học lên story nhé ✨",
];

export function WaitingPageClient({ token, initialLeafNumber }: WaitingPageProps) {
  const [data, setData] = useState<MeData | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(initialLeafNumber ?? 0);
  const [treeLayout, setTreeLayout] = useState<TreeLayout | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/me/${token}`);
    if (!res.ok) return;
    const json = (await res.json()) as MeData;
    setData(json);
    setTotalLeaves(json.totalLeaves);
    setLocked(json.submission.events.status === "locked");
    setLoading(false);

    const slug = json.submission.events.slug;
    const treeRes = await fetch(`/api/tree/${slug}`);
    if (treeRes.ok) {
      const treeData = (await treeRes.json()) as { layout: TreeLayout };
      setTreeLayout(treeData.layout);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: cập nhật số lá + reload tree
  useEffect(() => {
    if (!data?.submission.events.id) return;

    const supabase = createClient();
    const eventId = data.submission.events.id;
    const slug = data.submission.events.slug;

    const channel = supabase
      .channel(`waiting-${eventId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions", filter: `event_id=eq.${eventId}` },
        async () => {
          setTotalLeaves((n) => n + 1);
          const treeRes = await fetch(`/api/tree/${slug}`);
          if (treeRes.ok) {
            const treeData = (await treeRes.json()) as { layout: TreeLayout };
            setTreeLayout(treeData.layout);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events", filter: `id=eq.${eventId}` },
        (payload) => {
          const row = payload.new as { status: string };
          if (row.status === "locked") {
            setLocked(true);
            setCountdown(5);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data?.submission.events.id, data?.submission.events.slug]);

  // Đếm ngược khi admin chốt
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setReveal(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    const interval = setInterval(() => {
      setToast(TOASTS[Math.floor(Math.random() * TOASTS.length)] ?? "");
      setTimeout(() => setToast(null), 4000);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <motion.p
          className="text-ink-muted"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Đang tải lá của bạn… 🌿
        </motion.p>
      </div>
    );
  }

  if (!data) {
    return (
      <FadeIn className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-lg text-ink-muted">Không tìm thấy lá của bạn</p>
      </FadeIn>
    );
  }

  const { submission, insight } = data;
  const numerology = insight?.numerology;
  const slotNum = (submission.slot_index ?? 0) + 1;

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-8 pb-16">
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              key={countdown}
              className="font-display text-8xl font-black text-honey"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {countdown}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reveal && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/90 p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.p
              className="font-display text-3xl font-bold text-honey"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Lá của bạn đang sáng! ✨
            </motion.p>
            <AnimatedButton
              href={`/v/${submission.events.slug}?highlight=${submission.id}`}
              variant="primary"
              className="mt-6"
            >
              Xem cả cây 🌳
            </AnimatedButton>
          </motion.div>
        )}
      </AnimatePresence>

      <Stagger className="text-center">
        <StaggerItem>
          <motion.p
            className="font-display text-sm font-semibold uppercase tracking-widest text-peach"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Bạn là chiếc lá thứ {slotNum}
          </motion.p>
        </StaggerItem>
        <StaggerItem>
          <GradientText as="h1" className="font-display mt-1 text-2xl font-bold">
            Chào {submission.name}! 🌿
          </GradientText>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-2 text-ink-muted">
            Cây đã có{" "}
            <motion.strong
              className="text-sprout"
              key={totalLeaves}
              initial={{ scale: 1.4, color: "var(--peach)" }}
              animate={{ scale: 1, color: "var(--sprout)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {totalLeaves}
            </motion.strong>{" "}
            lá · lá của bạn đang ở đó
          </p>
        </StaggerItem>
      </Stagger>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 z-40 rounded-button bg-foreground px-5 py-3 text-sm text-white shadow-soft"
            style={{ x: "-50%" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cây thu nhỏ trực tiếp */}
      {treeLayout && (
        <FadeIn delay={0.2}>
          <section>
            <h2 className="font-display mb-3 text-lg font-bold text-foreground">
              Cây đang lớn 🌳
            </h2>
            <motion.div
              className="h-48 rounded-card overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TreeCanvas
                layout={treeLayout}
                mode="mini"
                highlightedId={submission.id}
                newLeafId={null}
                className="h-48 rounded-card"
              />
            </motion.div>
          </section>
        </FadeIn>
      )}

      {numerology?.content && (
        <FadeIn delay={0.3}>
          <section>
            <h2 className="font-display mb-4 text-lg font-bold text-foreground">
              Thần số học của bạn ✨
            </h2>
            <NumerologyCard
              name={submission.name}
              major={submission.major}
              numerology={numerology}
              content={numerology.content}
              aiText={insight?.ai_numerology}
              wishComment={insight?.ai_personalization?.wishComment}
              funFact={insight?.ai_personalization?.funFact}
              majorMatch={getMajorMatchMessage(numerology.lifePath, submission.major)}
            />
          </section>
        </FadeIn>
      )}

      <FadeIn delay={0.4}>
        <section>
          <h2 className="font-display mb-4 text-lg font-bold text-foreground">
            Flappy Lá 🍃
          </h2>
          <FlappyBirdGame
            token={token}
            eventId={submission.events.id}
            playerName={submission.name}
          />
        </section>
      </FadeIn>

      <FadeIn delay={0.5}>
        <section>
          <h2 className="font-display mb-4 text-lg font-bold text-foreground">
            Bảng xếp hạng 🏆
          </h2>
          <Leaderboard eventId={submission.events.id} />
        </section>
      </FadeIn>

      {(locked || submission.events.status === "locked") && !reveal && (
        <AnimatedButton
          href={`/v/${submission.events.slug}?highlight=${submission.id}`}
          variant="sprout"
          className="text-center"
        >
          Xem cả cây 🌳
        </AnimatedButton>
      )}
    </div>
  );
}
