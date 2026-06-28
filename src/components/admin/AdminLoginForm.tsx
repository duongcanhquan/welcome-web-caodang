"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicEnv } from "@/lib/config/env";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedButton, Stagger, StaggerItem } from "@/components/motion";

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Email hoặc mật khẩu không đúng.",
  "Email not confirmed": "Email chưa được xác nhận — liên hệ quản trị.",
};

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!hasSupabasePublicEnv()) {
      setError("Thiếu cấu hình Supabase trên server — kiểm tra biến môi trường.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(AUTH_ERRORS[authError.message] ?? authError.message);
      setLoading(false);
      return;
    }

    if (data.user?.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Tài khoản không có quyền admin. Chạy: node scripts/setup-admin.mjs");
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/admin/submissions");
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
          <h1 className="font-display text-center text-2xl font-bold text-brand-navy">
            Admin
          </h1>
        </StaggerItem>
        <StaggerItem>
          <form onSubmit={login} className="space-y-4">
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="w-full rounded-card border-2 border-brand-navy/15 bg-surface/80 px-4 py-3 backdrop-blur-sm focus:border-brand-navy focus:outline-none"
              whileFocus={{ scale: 1.01 }}
            />
            <motion.input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
              autoComplete="current-password"
              className="w-full rounded-card border-2 border-brand-navy/15 bg-surface/80 px-4 py-3 backdrop-blur-sm focus:border-brand-navy focus:outline-none"
              whileFocus={{ scale: 1.01 }}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-coral"
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
