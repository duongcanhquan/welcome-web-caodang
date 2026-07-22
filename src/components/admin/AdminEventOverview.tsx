"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EventCohortBadge } from "@/components/events/EventCohortBadge";
import { JoinLinkShare } from "@/components/admin/JoinLinkShare";
import { EVENT_MAJORS } from "@/lib/constants";
import { GradientText } from "@/components/motion";

export interface EventSettingsSnapshot {
  slug: string;
  name: string;
  status: string;
  batchLabel?: string;
  classLabel?: string;
  fillRatio: number;
  leavesMin: number;
  leavesMax: number;
  blossomEvery: number;
  maxFileMb: number;
  rateLimitPerIp: number;
  rootsText: string;
  totalSubmissions: number;
  aiEnabled?: boolean;
  hasApiKey?: boolean;
}

interface AdminEventOverviewProps {
  settings: EventSettingsSnapshot;
  aiEnabled?: boolean;
  hasApiKey?: boolean;
  treeLocked?: boolean;
}

export function AdminEventOverview({
  settings,
  aiEnabled,
  hasApiKey,
  treeLocked,
}: AdminEventOverviewProps) {
  const links = [
    {
      label: "🌳 Demo cây",
      href: "/demo/tree?present=1",
      desc: "Xem trước ~95 lá mẫu",
    },
    {
      label: "✨ Demo thần số học",
      href: "/demo/numerology",
      desc: "Màn chờ + kết quả",
    },
    {
      label: "Form gửi ảnh",
      href: `/join?event=${settings.slug}`,
      desc: treeLocked ? "Event này đã chốt" : "Link cho sinh viên",
    },
    {
      label: "Cây live",
      href: `/live/${settings.slug}`,
      desc: "Xem cây đang lớn",
    },
    ...(treeLocked
      ? [
          {
            label: "Xem điều kỳ diệu",
            href: `/v/${settings.slug}?present=1`,
            desc: "Cây đã chốt — trình chiếu",
          },
        ]
      : []),
    {
      label: "Trang chủ",
      href: "/",
      desc: "welcome.vietmycollege.com",
    },
  ];

  return (
    <motion.section
      className="space-y-5 rounded-card border border-peach/20 bg-surface/90 p-6 shadow-soft backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <GradientText as="h2" className="font-display text-2xl font-bold">
          Tổng quan sự kiện
        </GradientText>
        <div className="mt-2">
          <EventCohortBadge
            batchLabel={settings.batchLabel}
            classLabel={settings.classLabel}
            name={settings.name}
            slug={settings.slug}
          />
        </div>
        <p className="mt-1 text-base text-ink-muted">
          {settings.name} · <code className="text-peach">{settings.slug}</code>
        </p>
      </div>

      {!treeLocked && settings.status !== "locked" && (
        <JoinLinkShare eventSlug={settings.slug} highlight />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoRow
          label="Trạng thái"
          value={
            settings.status === "locked" ? "🔒 Đã chốt" : "🌱 Đang thu thập"
          }
        />
        <InfoRow label="Đã nộp" value={`${settings.totalSubmissions} bạn`} />
        <InfoRow label="Ảnh tối đa" value={`${settings.maxFileMb} MB`} />
        <InfoRow
          label="Giới hạn IP"
          value={
            settings.rateLimitPerIp <= 0
              ? "Không giới hạn"
              : `${settings.rateLimitPerIp}/IP·24h`
          }
        />
        <InfoRow label="Fill ratio" value={String(settings.fillRatio)} />
        <InfoRow
          label="Lá min–max"
          value={`${settings.leavesMin}–${settings.leavesMax}`}
        />
        <InfoRow label="Nở hoa mỗi" value={`${settings.blossomEvery} lá`} />
        <InfoRow
          label="DeepSeek AI"
          value={
            aiEnabled
              ? hasApiKey
                ? "✅ Bật"
                : "⚠️ Chưa có key"
              : "Tắt"
          }
        />
      </div>

      <div>
        <p className="mb-2 text-base font-semibold text-foreground">
          Ngành học ({EVENT_MAJORS.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EVENT_MAJORS.map((m) => (
            <span
              key={m}
              className="rounded-full bg-surface-warm px-2.5 py-0.5 text-sm text-ink-muted"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <p className="text-base text-ink-muted">
        <span className="font-semibold text-foreground">Gốc cây:</span>{" "}
        {settings.rootsText}
      </p>

      <div>
        <p className="mb-3 text-base font-semibold text-foreground">Link nhanh</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              className="rounded-xl border border-peach/20 bg-surface-warm/50 px-4 py-3 transition hover:border-peach/40 hover:bg-surface-warm"
            >
              <p className="text-base font-bold text-foreground">{link.label}</p>
              <p className="text-sm text-ink-muted">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-muted">
        Admin: <code>/admin</code> · Event đang quản lý:{" "}
        <code>{settings.slug}</code>
      </p>
    </motion.section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-warm/80 px-3 py-3">
      <p className="text-sm font-bold uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
