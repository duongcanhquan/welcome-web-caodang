"use client";

import type { TreeLeaf } from "@/lib/tree/types";
import { calculateNumerology, LIFE_PATH_CONTENT, getMajorMatchMessage } from "@/lib/numerology";

interface LeafDetailCardProps {
  leaf: TreeLeaf;
  dob?: string;
  onClose: () => void;
}

export function LeafDetailCard({ leaf, dob, onClose }: LeafDetailCardProps) {
  const numerology = dob ? calculateNumerology(dob) : null;
  const lpContent = numerology
    ? LIFE_PATH_CONTENT[numerology.lifePath]
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className="w-full max-w-sm animate-slide-up rounded-card bg-surface p-6 shadow-sticker"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-muted"
          aria-label="Đóng"
        >
          ✕
        </button>

        {leaf.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={leaf.photoUrl}
            alt={leaf.name ?? ""}
            className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-peach/30"
          />
        )}

        <h3 className="font-display mt-4 text-center text-xl font-bold">
          {leaf.name}
        </h3>
        <p className="text-center text-sm text-ink-muted">{leaf.major}</p>

        {leaf.wish && (
          <p className="mt-3 rounded-card bg-surface-warm px-4 py-3 text-sm italic">
            &ldquo;{leaf.wish}&rdquo;
          </p>
        )}

        {numerology && lpContent && (
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-center">
              <span className="font-display text-3xl font-black text-peach">
                {numerology.lifePath}
              </span>
              <span className="ml-2 text-ink-muted">{lpContent.keywords}</span>
            </p>
            <p className="text-xs text-ink-muted text-center">
              {getMajorMatchMessage(numerology.lifePath, leaf.major ?? "")}
            </p>
            <p className="text-xs text-center opacity-60">
              Cho vui & tham khảo ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
