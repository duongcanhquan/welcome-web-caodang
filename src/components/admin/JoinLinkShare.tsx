"use client";

import { useCallback, useState } from "react";
import { publicEnv } from "@/lib/config/env";

/** URL tuyệt đối form join cho sinh viên */
export function buildJoinUrl(eventSlug: string): string {
  const path = `/join?event=${encodeURIComponent(eventSlug)}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  const base = publicEnv.appUrl.replace(/\/$/, "");
  return `${base}${path}`;
}

interface JoinLinkShareProps {
  eventSlug: string;
  /** Hiện nổi bật sau khi tạo đợt */
  highlight?: boolean;
  className?: string;
}

export function JoinLinkShare({
  eventSlug,
  highlight = false,
  className = "",
}: JoinLinkShareProps) {
  const [copied, setCopied] = useState(false);
  const url = buildJoinUrl(eventSlug);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback chọn text
      const el = document.getElementById(`join-url-${eventSlug}`);
      if (el instanceof HTMLInputElement) {
        el.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [url, eventSlug]);

  return (
    <div
      className={`rounded-xl ${
        highlight
          ? "border-2 border-sprout/40 bg-sprout/10 p-4"
          : "border border-peach/20 bg-surface-warm/80 p-3"
      } ${className}`}
    >
      {highlight ? (
        <p className="mb-2 text-base font-bold text-sprout">
          Gửi link này cho sinh viên nộp ảnh
        </p>
      ) : (
        <p className="mb-1.5 text-sm font-semibold text-ink-muted">
          Link đăng ký / nộp ảnh
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          id={`join-url-${eventSlug}`}
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-peach/25 bg-white px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-peach"
        />
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          >
            {copied ? "Đã chép ✓" : "Sao chép"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border border-peach/30 px-4 py-2 text-sm font-semibold hover:bg-surface"
          >
            Mở
          </a>
        </div>
      </div>
    </div>
  );
}
