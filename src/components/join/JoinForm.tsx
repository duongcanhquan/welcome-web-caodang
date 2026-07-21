"use client";

import { useCallback, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  formatBytes,
  resizeImageClientDetailed,
  saveSubmissionToken,
  type ResizeResult,
} from "@/lib/image/client-resize";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";
import { formatDobInput, parseDobDdMmYyyy } from "@/lib/date/parse-dob";
import { AnimatedButton } from "@/components/motion";

interface JoinFormProps {
  majors: string[];
  eventSlug?: string;
  maxFileMb?: number;
  onOpenPrompt?: () => void;
}

const fieldClass =
  "w-full rounded-xl border-2 border-brand-navy/10 bg-surface-warm/90 px-4 py-3 text-foreground outline-none transition focus:border-brand-navy/40 focus:bg-white";

export function JoinForm({
  majors,
  eventSlug = DEFAULT_EVENT_SLUG,
  maxFileMb = 5,
  onOpenPrompt,
}: JoinFormProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<ResizeResult | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setCompressed(null);

      const maxBytes = maxFileMb * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`Ảnh gốc quá lớn (tối đa ${maxFileMb}MB trước khi nén).`);
        return;
      }

      const quickUrl = URL.createObjectURL(file);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return quickUrl;
      });

      setCompressing(true);
      try {
        const result = await resizeImageClientDetailed(file);
        setCompressed(result);
        const finalUrl = URL.createObjectURL(result.blob);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return finalUrl;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không nén được ảnh");
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setCompressed(null);
      } finally {
        setCompressing(false);
      }
    },
    [maxFileMb]
  );

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void processFile(file);
  };

  const onDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDob(formatDobInput(e.target.value));
  };

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading || compressing) return;
      setError(null);
      setLoading(true);

      try {
        const form = e.currentTarget;
        const fd = new FormData(form);
        fd.set("eventSlug", eventSlug);

        if (!compressed?.blob) throw new Error("Vui lòng chọn hoặc chụp ảnh");
        if (!dob.trim()) throw new Error("Vui lòng nhập ngày sinh");

        const dobIso = parseDobDdMmYyyy(dob);
        fd.set("dob", dobIso);
        fd.set(
          "photo",
          new File([compressed.blob], "photo.jpg", { type: "image/jpeg" })
        );

        const res = await fetch("/api/submit", { method: "POST", body: fd });
        const data = (await res.json()) as {
          ok: boolean;
          token?: string;
          leafNumber?: number;
          error?: string;
        };

        if (!data.ok || !data.token) {
          throw new Error(data.error ?? "Gửi thất bại");
        }

        saveSubmissionToken(data.token);

        try {
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { y: 0.75 },
            colors: ["#FF6FA5", "#3DBE8B", "#FFD15C"],
          });
        } catch {
          /* ignore */
        }

        window.location.assign(
          `/me/${data.token}?leaf=${data.leafNumber}&new=1`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
        setLoading(false);
      }
    },
    [compressed, dob, eventSlug, loading, compressing]
  );

  const savedPct =
    compressed && compressed.originalBytes > 0
      ? Math.round(
          (1 - compressed.compressedBytes / compressed.originalBytes) * 100
        )
      : 0;

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-peach/25 via-honey/20 to-sprout/20 shadow-[0_12px_40px_rgb(255_111_165_/_28%)] ring-4 ring-peach/20">
          {compressing && !preview ? (
            <span className="px-3 text-center text-sm font-bold text-brand-navy">
              Đang mở ảnh…
            </span>
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 px-4 text-center">
              <span className="font-display text-sm font-bold leading-tight text-brand-navy">
                Ảnh của bạn
              </span>
              <span className="text-xs font-semibold text-peach">Bắt buộc</span>
            </div>
          )}
          {compressing && preview && (
            <div className="absolute inset-x-0 bottom-0 bg-brand-navy/75 py-1 text-center text-[11px] font-bold text-white">
              Đang nén…
            </div>
          )}
        </div>

        <div className="flex w-full gap-2">
          <AnimatedButton
            type="button"
            variant="secondary"
            disabled={compressing || loading}
            onClick={() => cameraRef.current?.click()}
            className="flex-1 border-2 border-brand-navy/15 bg-brand-navy px-3 py-3 text-sm font-bold text-white shadow-md disabled:opacity-60"
          >
            Chụp ảnh
          </AnimatedButton>
          <AnimatedButton
            type="button"
            variant="secondary"
            disabled={compressing || loading}
            onClick={() => galleryRef.current?.click()}
            className="flex-1 border-2 border-brand-navy/20 bg-white px-3 py-3 text-sm font-bold text-brand-navy disabled:opacity-60"
          >
            Chọn từ máy
          </AnimatedButton>
        </div>

        {onOpenPrompt && (
          <button
            type="button"
            onClick={onOpenPrompt}
            className="w-full rounded-full border border-dashed border-brand-navy/25 bg-brand-navy/[0.04] px-3 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy/10"
          >
            Chưa có ảnh? Mở Prompt AI →
          </button>
        )}

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPhotoChange}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="hidden"
          onChange={onPhotoChange}
        />

        <p className="text-center text-xs text-ink-muted">
          Tối đa {maxFileMb}MB · tự nén trước khi gửi
        </p>
        {compressed && (
          <p className="text-center text-xs text-ink-muted">
            Đã nén: {formatBytes(compressed.originalBytes)} →{" "}
            <span className="font-semibold text-sprout">
              {formatBytes(compressed.compressedBytes)}
            </span>
            {savedPct > 0 ? ` (−${savedPct}%)` : ""}
          </p>
        )}
      </div>

      <Field label="Họ và tên" name="name" required placeholder="Nguyễn Văn A" />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="dob" className="text-sm font-semibold text-brand-navy">
          Ngày sinh <span className="text-coral">*</span>
        </label>
        <input
          id="dob"
          name="dobDisplay"
          type="text"
          inputMode="numeric"
          value={dob}
          onChange={onDobChange}
          required
          placeholder="dd/mm/yyyy"
          maxLength={10}
          autoComplete="bday"
          className={fieldClass}
        />
        <p className="text-xs text-ink-muted">Ví dụ: 23/05/2008</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="major"
          className="text-sm font-semibold text-brand-navy"
        >
          Ngành học
        </label>
        <select id="major" name="major" required className={fieldClass}>
          <option value="">— Chọn ngành —</option>
          {majors.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </p>
      )}

      <AnimatedButton
        type="submit"
        variant="sprout"
        disabled={loading || compressing || !compressed}
        className="w-full px-4 py-4 text-base leading-snug shadow-sticker ring-2 ring-white/50 disabled:opacity-60 sm:text-lg"
      >
        {loading
          ? "Đang gửi…"
          : compressing
            ? "Đang nén ảnh…"
            : "Gửi ảnh — Nhận Bất ngờ & Xem thần số học"}
      </AnimatedButton>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-brand-navy">
        {label}
        {required ? <span className="text-coral"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={fieldClass}
      />
    </div>
  );
}
