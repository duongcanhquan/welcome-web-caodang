"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedButton } from "@/components/motion";

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
        numerologyPrompt: numerologyPrompt || undefined,
      };
      if (apiKey) body.deepseekApiKey = apiKey;

      const res = await fetch("/api/admin/secrets", {
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
          <label className="text-base font-semibold">Prompt thần số học (tuỳ chọn)</label>
          <textarea
            value={numerologyPrompt}
            onChange={(e) => setNumerologyPrompt(e.target.value)}
            rows={4}
            placeholder="Để trống = dùng prompt mặc định"
            className="resize-none rounded-card border-2 border-peach/20 px-4 py-3 text-base focus:border-peach focus:outline-none"
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
