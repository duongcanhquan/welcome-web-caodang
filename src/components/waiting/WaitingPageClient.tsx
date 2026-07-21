"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NumerologyWaitingScreen } from "@/components/waiting/NumerologyWaitingScreen";
import { NumerologyCard } from "@/components/numerology/NumerologyCard";
import { FlappyBirdGame } from "@/components/game/FlappyBirdGame";
import { Leaderboard } from "@/components/game/Leaderboard";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import {
  AnimatedButton,
  MagicalSkyBackground,
  Stagger,
  StaggerItem,
} from "@/components/motion";
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
    ai_generated_at?: string | null;
  } | null;
  totalLeaves: number;
}

interface WaitingPageProps {
  token: string;
  initialLeafNumber?: number;
  isNewSubmission?: boolean;
}

const TOASTS = [
  "Lá của bạn đã trên cây — thử tìm tên mình nhé 🌿",
  "Chia sẻ thần số học lên story ✨",
  "Thử chơi Flappy Lá xem ai bay cao nhất! 🍃",
  "Cây đang lớn từng chiếc lá — bạn là một phần của điều kỳ diệu",
];

export function WaitingPageClient({
  token,
  initialLeafNumber,
  isNewSubmission = false,
}: WaitingPageProps) {
  const [data, setData] = useState<MeData | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(initialLeafNumber ?? 0);
  const [treeLayout, setTreeLayout] = useState<TreeLayout | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fetchDone, setFetchDone] = useState(false);
  const [minWaitDone, setMinWaitDone] = useState(!isNewSubmission);
  const [revealNumerology, setRevealNumerology] = useState(!isNewSubmission);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/me/${token}`);
    if (!res.ok) {
      setFetchDone(true);
      return;
    }
    const json = (await res.json()) as MeData;
    setData(json);
    setTotalLeaves(json.totalLeaves);
    setLocked(json.submission.events.status === "locked");
    setFetchDone(true);

    // Cây tải nền — không chặn hiện thần số học
    const slug = json.submission.events.slug;
    void fetch(`/api/tree/${slug}`)
      .then(async (treeRes) => {
        if (!treeRes.ok) return;
        const treeData = (await treeRes.json()) as { layout: TreeLayout };
        setTreeLayout(treeData.layout);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll ngắn để nhận bản AI (enrich sau submit) nếu đang chờ
  useEffect(() => {
    if (!isNewSubmission || !fetchDone) return;
    if (data?.insight?.ai_generated_at) return;

    let tries = 0;
    const id = setInterval(async () => {
      tries += 1;
      if (tries > 8) {
        clearInterval(id);
        return;
      }
      const res = await fetch(`/api/me/${token}`);
      if (!res.ok) return;
      const json = (await res.json()) as MeData;
      if (json.insight?.ai_generated_at) {
        setData(json);
        clearInterval(id);
      }
    }, 2500);
    return () => clearInterval(id);
  }, [isNewSubmission, fetchDone, data?.insight?.ai_generated_at, token]);

  useEffect(() => {
    if (!data?.submission.events.id) return;

    const supabase = createClient();
    const eventId = data.submission.events.id;
    const slug = data.submission.events.slug;

    let treeRefreshTimer: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel(`waiting-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          setTotalLeaves((n) => n + 1);
          // Debounce — tránh storm khi nhiều SV nộp cùng lúc
          if (treeRefreshTimer) clearTimeout(treeRefreshTimer);
          treeRefreshTimer = setTimeout(() => {
            void fetch(`/api/tree/${slug}`)
              .then(async (treeRes) => {
                if (!treeRes.ok) return;
                const treeData = (await treeRes.json()) as { layout: TreeLayout };
                setTreeLayout(treeData.layout);
              })
              .catch(() => {});
          }, 1200);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
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
      if (treeRefreshTimer) clearTimeout(treeRefreshTimer);
      supabase.removeChannel(channel);
    };
  }, [data?.submission.events.id, data?.submission.events.slug]);

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
    if (!revealNumerology) return;
    const interval = setInterval(() => {
      setToast(TOASTS[Math.floor(Math.random() * TOASTS.length)] ?? "");
      setTimeout(() => setToast(null), 4000);
    }, 14000);
    return () => clearInterval(interval);
  }, [revealNumerology]);

  useEffect(() => {
    if (minWaitDone && fetchDone && isNewSubmission) {
      setRevealNumerology(true);
    }
  }, [minWaitDone, fetchDone, isNewSubmission]);

  if (isNewSubmission && (!minWaitDone || !fetchDone)) {
    return (
      <NumerologyWaitingScreen
        name={data?.submission.name}
        minDurationMs={5000}
        onComplete={() => setMinWaitDone(true)}
      />
    );
  }

  if (!isNewSubmission && !fetchDone) {
    return (
      <NumerologyWaitingScreen
        minDurationMs={3000}
        onComplete={() => setFetchDone(true)}
      />
    );
  }

  if (!data) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <MagicalSkyBackground variant="twilight" className="fixed inset-0 -z-10" />
        <p className="text-lg text-white/80">Không tìm thấy lá của bạn</p>
      </div>
    );
  }

  const { submission, insight } = data;
  const numerology = insight?.numerology;
  const slotNum = (submission.slot_index ?? 0) + 1;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MagicalSkyBackground variant="twilight" className="fixed inset-0 -z-10" />

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
              Xem điều kỳ diệu ✨
            </AnimatedButton>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-20">
        <Stagger className="text-center">
          <StaggerItem>
            <motion.p
              className="font-display text-xs font-bold uppercase tracking-[0.25em] text-honey"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Bạn là chiếc lá thứ {slotNum}
            </motion.p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="font-display mt-2 text-3xl font-bold text-white drop-shadow-lg">
              Chào {submission.name}! 🌿
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-2 text-white/75">
              Cây đã có{" "}
              <motion.strong
                key={totalLeaves}
                className="text-honey"
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {totalLeaves}
              </motion.strong>{" "}
              lá
            </p>
          </StaggerItem>
        </Stagger>

        <AnimatePresence>
          {toast && (
            <motion.div
              className="fixed bottom-6 left-1/2 z-40 max-w-sm rounded-button border border-white/20 bg-brand-navy/90 px-5 py-3 text-center text-sm text-white shadow-lg backdrop-blur-md"
              style={{ x: "-50%" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {numerology?.content && revealNumerology && (
          <section>
            <h2 className="font-display mb-4 text-center text-lg font-bold text-white">
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
              reveal={isNewSubmission}
            />
          </section>
        )}

        {treeLayout && (
          <section>
            <h2 className="font-display mb-3 text-lg font-bold text-white">
              Cây đang lớn 🌳
            </h2>
            <motion.div
              className="h-52 overflow-hidden rounded-2xl border border-white/20 shadow-xl"
              whileHover={{ scale: 1.01 }}
            >
              <TreeCanvas
                layout={treeLayout}
                mode="mini"
                highlightedId={submission.id}
                className="h-52"
              />
            </motion.div>
          </section>
        )}

        <section className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
          <h2 className="font-display mb-4 text-lg font-bold text-white">
            Flappy Lá 🍃
          </h2>
          <FlappyBirdGame
            token={token}
            eventId={submission.events.id}
            playerName={submission.name}
          />
        </section>

        <section className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
          <h2 className="font-display mb-4 text-lg font-bold text-white">
            Bảng xếp hạng 🏆
          </h2>
          <Leaderboard eventId={submission.events.id} />
        </section>

        {(locked || submission.events.status === "locked") && !reveal && (
          <AnimatedButton
            href={`/v/${submission.events.slug}?highlight=${submission.id}`}
            variant="sprout"
            className="w-full text-center"
          >
            Xem điều kỳ diệu ✨
          </AnimatedButton>
        )}
      </div>
    </div>
  );
}
