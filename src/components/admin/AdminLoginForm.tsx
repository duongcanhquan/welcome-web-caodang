"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedButton, Stagger, StaggerItem } from "@/components/motion";

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: username.trim().toLowerCase(),
          password,
        }),
      });

      const payload = (await res.json()) as { error?: string; ok?: boolean };

      if (!res.ok) {
        setError(payload.error ?? "Đăng nhập thất bại.");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      const dest =
        next && next.startsWith("/admin") ? next : "/admin/submissions";

      window.location.assign(dest);
    } catch {
      setError("Không kết nối được server. Thử lại sau vài giây.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Stagger className="w-full max-w-sm space-y-6">
        <StaggerItem>
          <div className="flex justify-center">
            <Image
              src="/branding/logo-vietmy.png"
              alt="Việt Mỹ College"
              width={200}
              height={86}
              className="h-auto w-48 object-contain"
            />
          </div>
        </StaggerItem>
        <StaggerItem>
          <h1 className="font-display text-center text-3xl font-bold text-brand-navy">
            Admin
          </h1>
        </StaggerItem>
        <StaggerItem>
          <form onSubmit={login} className="space-y-4">
            <motion.input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tài khoản"
              required
              autoComplete="username"
              className="w-full rounded-card border-2 border-brand-navy/15 bg-surface/80 px-4 py-3.5 text-base focus:border-brand-navy focus:outline-none"
              whileFocus={{ scale: 1.01 }}
            />
            <motion.input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
              autoComplete="current-password"
              className="w-full rounded-card border-2 border-brand-navy/15 bg-surface/80 px-4 py-3.5 text-base focus:border-brand-navy focus:outline-none"
              whileFocus={{ scale: 1.01 }}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-base text-coral"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatedButton
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3 disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </AnimatedButton>
          </form>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
