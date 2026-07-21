"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedButton } from "@/components/motion";
import { DEFAULT_NUMEROLOGY_PROMPT } from "@/lib/ai/numerology-prompt";

interface AdminSecretsFormProps {
  eventId: string;
  embedded?: boolean;
}

export function AdminSecretsForm({ eventId, embedded }: AdminSecretsFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [numerologyPrompt, setNumerologyPrompt] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/secrets?eventId=${eventId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.deepseek_model) setModel(data.deepseek_model);
        if (data.ai_enabled != null) setAiEnabled(data.ai_enabled);
        if (data.numerology_prompt) setNumerologyPrompt(data.numerology_prompt);
        setHasApiKey(data.hasApiKey ?? false);
      })
      .catch(() => {});
  }, [eventId]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {
        eventId,
        deepseekModel: model,
        aiEnabled,
        // Chuỗi rỗng = về prompt mặc định hệ thống
        numerologyPrompt,
      };
      if (apiKey) body.deepseekApiKey = apiKey;

      const res = await fetch(`/api/admin/secrets`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("Đã lưu cấu hình DeepSeek ✓");
      if (apiKey) {
        setHasApiKey(true);
        setApiKey("");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      {!embedded && (
        <h2 className="font-display text-xl font-bold text-foreground">
          Cài đặt AI
        </h2>
      )}

      <motion.div
        className="space-y-4 rounded-card border border-peach/15 bg-surface/90 p-6 shadow-soft"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h3 className="font-semibold text-foreground">DeepSeek API</h3>
          <p className="mt-1 text-base text-ink-muted">
            Cá nhân hoá thần số học — API key chỉ lưu server-side.
          </p>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            className="h-4 w-4 accent-sprout"
          />
          <span className="text-base font-medium">Bật cá nhân hoá AI</span>
        </label>

        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold">
            API Key {hasApiKey && <span className="text-sprout">(đã lưu ✓)</span>}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasApiKey ? "Nhập key mới để thay thế" : "sk-..."}
            className="rounded-card border-2 border-peach/20 px-4 py-3 focus:border-peach focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-card border-2 border-peach/20 px-4 py-3 focus:border-peach focus:outline-none"
          >
            <option value="deepseek-chat">deepseek-chat</option>
            <option value="deepseek-reasoner">deepseek-reasoner</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-base font-semibold">Prompt thần số học</label>
            <button
              type="button"
              onClick={() => setNumerologyPrompt(DEFAULT_NUMEROLOGY_PROMPT)}
              className="text-sm font-semibold text-peach underline-offset-2 hover:underline"
            >
              Chèn prompt Gen Z chuẩn
            </button>
          </div>
          <p className="rounded-lg bg-brand-navy/5 px-3 py-2 text-sm leading-relaxed text-ink-muted">
            <strong className="text-foreground">Không cần điền tên / ngày sinh</strong>{" "}
            vào prompt. Mỗi lần SV gửi form, hệ thống tự gửi JSON gồm{" "}
            <code className="text-xs">name</code>,{" "}
            <code className="text-xs">dobDisplay</code> (dd/mm/yyyy),{" "}
            <code className="text-xs">lifePath</code>,{" "}
            <code className="text-xs">major</code>,{" "}
            <code className="text-xs">wish</code>, … Ô này chỉ là{" "}
            <em>system prompt</em> (vai trò + cấu trúc bài). Để trống = dùng mặc
            định Gen Z của hệ thống.
          </p>
          <textarea
            value={numerologyPrompt}
            onChange={(e) => setNumerologyPrompt(e.target.value)}
            rows={14}
            placeholder="Để trống = prompt Gen Z mặc định. Bấm «Chèn prompt Gen Z chuẩn» để xem/sửa."
            className="resize-y rounded-card border-2 border-peach/20 px-4 py-3 font-mono text-sm leading-relaxed focus:border-peach focus:outline-none"
          />
        </div>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-base text-sprout"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatedButton
          onClick={save}
          disabled={saving}
          variant="sprout"
          className="w-full py-3 disabled:opacity-60"
        >
          {saving ? "Đang lưu…" : "Lưu cấu hình"}
        </AnimatedButton>
      </motion.div>
    </section>
  );
}
