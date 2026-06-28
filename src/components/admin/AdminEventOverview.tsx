"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EVENT_MAJORS, DEFAULT_EVENT_SLUG } from "@/lib/constants";
import { GradientText } from "@/components/motion";

export interface EventSettingsSnapshot {
  slug: string;
  name: string;
  status: string;
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
}

export function AdminEventOverview({
  settings,
  aiEnabled,
  hasApiKey,
}: AdminEventOverviewProps) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const links = [
    {
      label: "🌳 Demo cây hoàn chỉnh",
      href: "/demo/tree?present=1",
      desc: "Xem trước ~95 lá mẫu — trình chiếu",
      highlight: true,
    },
    {
      label: "✨ Demo thần số học",
      href: "/demo/numerology",
      desc: "Màn chờ quote + kết quả",
      highlight: true,
    },
    {
      label: "Màn LIVE",
      href: `/live/${settings.slug}`,
      desc: "Realtime khi thu thập",
    },
    {
      label: "Xem điều kỳ diệu",
      href: `/v/${settings.slug}`,
      desc: "Cây công khai",
    },
    {
      label: "Trình chiếu cây thật",
      href: `/v/${settings.slug}?present=1`,
      desc: "Fullscreen nếu đã có lá",
    },
    {
      label: "Trang chủ",
      href: "/",
      desc: "welcome.vietmycollege.com",
    },
    {
      label: "Form gửi lá",
      href: "/join",
      desc: "Sinh viên gửi & xem thần số",
    },
  ];

  return (
    <motion.section
      className="space-y-5 rounded-card border border-peach/20 bg-surface/90 p-6 shadow-soft backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <GradientText as="h2" className="font-display text-xl font-bold">
          Cài đặt sự kiện
        </GradientText>
        <p className="mt-1 text-sm text-ink-muted">
          {settings.name} · slug: <code className="text-peach">{settings.slug}</code>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoRow label="Trạng thái" value={settings.status === "locked" ? "🔒 Đã chốt" : "🌱 Đang thu thập"} />
        <InfoRow label="Lá hiện có" value={`${settings.totalSubmissions} lá`} />
        <InfoRow label="Fill ratio" value={String(settings.fillRatio)} />
        <InfoRow label="Lá min / max" value={`${settings.leavesMin} – ${settings.leavesMax}`} />
        <InfoRow label="Nở hoa mỗi" value={`${settings.blossomEvery} lá`} />
        <InfoRow label="Ảnh tối đa" value={`${settings.maxFileMb} MB`} />
        <InfoRow label="Rate limit / IP" value={`${settings.rateLimitPerIp} / 24h`} />
        <InfoRow
          label="DeepSeek AI"
          value={
            aiEnabled
              ? hasApiKey
                ? "✅ Bật + có API key"
                : "⚠️ Bật nhưng chưa có key"
              : "Tắt"
          }
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Ngành học ({EVENT_MAJORS.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {EVENT_MAJORS.map((m) => (
            <span
              key={m}
              className="rounded-full bg-surface-warm px-2.5 py-0.5 text-xs text-ink-muted"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-ink-muted">
        <span className="font-semibold text-foreground">Gốc cây:</span> {settings.rootsText}
      </p>

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Link nhanh</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              className={`rounded-xl border px-4 py-3 transition hover:scale-[1.02] ${
                link.highlight
                  ? "border-sprout/40 bg-sprout/10"
                  : "border-peach/20 bg-surface-warm/50"
              }`}
            >
              <p className="text-sm font-bold text-foreground">{link.label}</p>
              <p className="text-xs text-ink-muted">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Admin URL: <code>/admin</code> · Event mặc định: <code>{DEFAULT_EVENT_SLUG}</code>
        {base ? ` · Site: ${base}` : ""}
      </p>
    </motion.section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-warm/80 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
