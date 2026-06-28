"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { SEED_EVENT_ID } from "@/lib/constants";
import { AnimatedButton, GradientText, Stagger, StaggerItem } from "@/components/motion";

export function AdminSecretsForm() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [numerologyPrompt, setNumerologyPrompt] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/secrets?eventId=${SEED_EVENT_ID}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.deepseek_model) setModel(data.deepseek_model);
        if (data.ai_enabled != null) setAiEnabled(data.ai_enabled);
        if (data.numerology_prompt) setNumerologyPrompt(data.numerology_prompt);
        setHasApiKey(data.hasApiKey ?? false);
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {
        eventId: SEED_EVENT_ID,
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

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-6 py-10">
      <Stagger>
        <StaggerItem>
          <div className="flex items-center justify-between">
            <GradientText as="h1" className="font-display text-2xl font-bold">
              Admin — Cài đặt AI
            </GradientText>
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/admin/submissions" className="text-sm text-peach underline">
                  Kiểm duyệt
                </Link>
              </motion.div>
              <button
                onClick={logout}
                className="text-sm text-ink-muted underline"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <motion.section
            className="space-y-4 rounded-card bg-surface/90 p-6 shadow-soft backdrop-blur-sm"
            whileHover={{ boxShadow: "0 8px 32px rgb(255 111 165 / 12%)" }}
          >
            <h2 className="font-semibold text-foreground">DeepSeek API</h2>
            <p className="text-sm text-ink-muted">
              Dùng để cá nhân hoá thần số học và nội dung cho từng sinh viên.
              API key chỉ lưu server-side, không hiển thị công khai.
            </p>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="h-4 w-4 accent-sprout"
              />
              <span className="text-sm font-medium">Bật cá nhân hoá AI</span>
            </label>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">
                API Key {hasApiKey && <span className="text-sprout">(đã lưu ✓)</span>}
              </label>
              <motion.input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasApiKey ? "Nhập key mới để thay thế" : "sk-..."}
                className="rounded-card border-2 border-peach/20 px-4 py-3 focus:border-peach focus:outline-none"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Model</label>
              <motion.select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-card border-2 border-peach/20 px-4 py-3 focus:border-peach focus:outline-none"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="deepseek-chat">deepseek-chat</option>
                <option value="deepseek-reasoner">deepseek-reasoner</option>
              </motion.select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">
                Prompt thần số học (tuỳ chọn)
              </label>
              <motion.textarea
                value={numerologyPrompt}
                onChange={(e) => setNumerologyPrompt(e.target.value)}
                rows={4}
                placeholder="Để trống = dùng prompt mặc định"
                className="rounded-card border-2 border-peach/20 px-4 py-3 focus:border-peach focus:outline-none resize-none text-sm"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-sprout"
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
          </motion.section>
        </StaggerItem>

        <StaggerItem>
          <p className="text-center text-xs text-ink-muted">
            R2 storage: cấu hình sau trong .env.local — sẽ hướng dẫn riêng.
          </p>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
