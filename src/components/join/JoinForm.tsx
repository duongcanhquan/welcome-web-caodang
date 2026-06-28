"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";
import { resizeImageClient, saveSubmissionToken } from "@/lib/image/client-resize";
import { DEFAULT_EVENT_SLUG } from "@/lib/constants";
import { formatDobInput, parseDobDdMmYyyy } from "@/lib/date/parse-dob";
import { AnimatedButton, Stagger, StaggerItem } from "@/components/motion";

interface JoinFormProps {
  majors: string[];
  eventSlug?: string;
  maxFileMb?: number;
}

export function JoinForm({
  majors,
  eventSlug = DEFAULT_EVENT_SLUG,
  maxFileMb = 5,
}: JoinFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const onDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDob(formatDobInput(e.target.value));
  };

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        const form = e.currentTarget;
        const fd = new FormData(form);
        fd.set("eventSlug", eventSlug);

        const file = fileRef.current?.files?.[0];
        if (!file) throw new Error("Vui lòng chọn ảnh");

        if (!dob.trim()) throw new Error("Vui lòng nhập ngày sinh");

        const dobIso = parseDobDdMmYyyy(dob);
        fd.set("dob", dobIso);

        const resized = await resizeImageClient(file);
        fd.set("photo", new File([resized], "photo.jpg", { type: "image/jpeg" }));

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

        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#FF6FA5", "#3DBE8B", "#FFD15C", "#FFAE3B"],
        });

        router.push(`/me/${data.token}?leaf=${data.leafNumber}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    },
    [dob, eventSlug, router]
  );

  return (
    <form onSubmit={onSubmit}>
      <Stagger className="flex w-full max-w-md flex-col gap-5">
        <StaggerItem>
          <div className="flex flex-col items-center gap-3">
            <motion.button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-peach/40 bg-surface-warm shadow-soft"
              whileHover={{ scale: 1.05, borderColor: "var(--peach)" }}
              whileTap={{ scale: 0.95 }}
              animate={
                preview
                  ? {}
                  : {
                      boxShadow: [
                        "0 4px 24px rgb(255 111 165 / 10%)",
                        "0 8px 32px rgb(255 111 165 / 25%)",
                        "0 4px 24px rgb(255 111 165 / 10%)",
                      ],
                    }
              }
              transition={{ duration: 2, repeat: preview ? 0 : Infinity }}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-center text-sm text-ink-muted">
                  📸 Chọn ảnh
                  <br />
                  <span className="text-xs text-coral">* Bắt buộc</span>
                  <br />
                  <span className="text-xs">(tối đa {maxFileMb}MB)</span>
                </span>
              )}
            </motion.button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={onPhotoChange}
              required
            />
          </div>
        </StaggerItem>

        <StaggerItem>
          <Field label="Họ và tên" name="name" required placeholder="Nguyễn Văn A" />
        </StaggerItem>

        <StaggerItem>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dob" className="text-sm font-semibold text-foreground">
              Ngày sinh <span className="text-coral">*</span>
            </label>
            <motion.input
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
              className="rounded-card border-2 border-peach/20 bg-surface px-4 py-3 text-foreground focus:border-peach focus:outline-none"
              whileFocus={{ scale: 1.01, borderColor: "var(--peach)" }}
            />
            <p className="text-xs text-ink-muted">Ví dụ: 23/05/2008</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="major" className="text-sm font-semibold text-foreground">
              Ngành học
            </label>
            <motion.select
              id="major"
              name="major"
              required
              className="rounded-card border-2 border-peach/20 bg-surface px-4 py-3 text-foreground focus:border-peach focus:outline-none"
              whileFocus={{ scale: 1.01, borderColor: "var(--peach)" }}
            >
              <option value="">— Chọn ngành —</option>
              {majors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </motion.select>
          </div>
        </StaggerItem>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-card bg-coral/10 px-4 py-3 text-sm text-coral"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <StaggerItem>
          <AnimatedButton
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-60"
          >
            {loading ? "Đang xử lý… ✨" : "Gửi & Xem Thần số học ✨"}
          </AnimatedButton>
        </StaggerItem>
      </Stagger>
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
      <label htmlFor={name} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <motion.input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-card border-2 border-peach/20 bg-surface px-4 py-3 text-foreground focus:border-peach focus:outline-none"
        whileFocus={{ scale: 1.01, borderColor: "var(--peach)" }}
      />
    </div>
  );
}
