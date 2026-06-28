"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/motion";
import type { EventSettingsSnapshot } from "./AdminEventOverview";
import { AdminEventOverview } from "./AdminEventOverview";
import { AdminSubmissionsList } from "./AdminSubmissionsList";
import { AdminModerationGrid } from "./AdminModerationGrid";
import { AdminSecretsForm } from "./AdminSecretsForm";
import { AdminLockTree } from "./AdminLockTree";

export type AdminTab = "tong-quan" | "danh-sach" | "kiem-duyet" | "cai-dat";

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "tong-quan", label: "Tổng quan", icon: "📊" },
  { id: "danh-sach", label: "Đã nộp", icon: "📋" },
  { id: "kiem-duyet", label: "Kiểm duyệt", icon: "🖼️" },
  { id: "cai-dat", label: "Cài đặt AI", icon: "⚙️" },
];

interface AdminDashboardProps {
  eventId: string;
  eventSlug: string;
  eventStatus: string;
  snapshot: EventSettingsSnapshot | null;
}

export function AdminDashboard({
  eventId,
  eventSlug,
  eventStatus,
  snapshot,
}: AdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as AdminTab | null;
  const activeTab: AdminTab =
    tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : "tong-quan";

  const setTab = (tab: AdminTab) => {
    router.push(`/admin/submissions?tab=${tab}`, { scroll: false });
  };

  const logout = async () => {
    await createClient().auth.signOut();
    window.location.href = "/admin";
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 pb-16">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-peach/15 pb-5">
        <div className="flex items-center gap-4">
          <Image
            src="/branding/logo-vietmy.png"
            alt="Việt Mỹ College"
            width={120}
            height={52}
            className="h-10 w-auto object-contain"
          />
          <div>
            <GradientText as="h1" className="font-display text-xl font-bold sm:text-2xl">
              Admin WELCOME
            </GradientText>
            <p className="text-xs text-ink-muted sm:text-sm">
              {snapshot?.name ?? "Sự kiện"} ·{" "}
              {eventStatus === "locked" ? "🔒 Đã chốt cây" : "🌱 Đang thu thập"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-peach/25 px-4 py-2 text-sm text-ink-muted transition hover:bg-surface-warm"
        >
          Đăng xuất
        </button>
      </header>

      <nav
        className="mb-6 flex gap-1 overflow-x-auto rounded-card border border-peach/15 bg-surface/80 p-1 shadow-soft backdrop-blur-sm"
        aria-label="Admin tabs"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-brand-navy text-white shadow-md"
                : "text-ink-muted hover:bg-surface-warm hover:text-foreground"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
            {tab.id === "danh-sach" && snapshot && snapshot.totalSubmissions > 0 && (
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeTab === tab.id ? "bg-white/20" : "bg-peach/15 text-peach"
                }`}
              >
                {snapshot.totalSubmissions}
              </span>
            )}
          </button>
        ))}
      </nav>

      {activeTab === "tong-quan" && (
        <div className="space-y-6">
          {snapshot && (
            <AdminEventOverview
              settings={snapshot}
              aiEnabled={snapshot.aiEnabled}
              hasApiKey={snapshot.hasApiKey}
              treeLocked={eventStatus === "locked"}
            />
          )}
          {eventStatus !== "locked" && (
            <AdminLockTree eventId={eventId} eventSlug={eventSlug} />
          )}
        </div>
      )}

      {activeTab === "danh-sach" && (
        <AdminSubmissionsList eventId={eventId} eventSlug={eventSlug} />
      )}

      {activeTab === "kiem-duyet" && (
        <AdminModerationGrid eventId={eventId} />
      )}

      {activeTab === "cai-dat" && (
        <AdminSecretsForm eventId={eventId} embedded />
      )}
    </div>
  );
}
