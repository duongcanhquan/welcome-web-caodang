"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedButton, GradientText, Stagger, StaggerItem } from "@/components/motion";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = "/admin/settings";
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Stagger className="w-full max-w-sm space-y-6">
        <StaggerItem>
          <GradientText as="h1" className="font-display text-2xl font-bold text-center">
            Admin đăng nhập
          </GradientText>
        </StaggerItem>
        <StaggerItem>
          <form onSubmit={login} className="space-y-4">
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-card border-2 border-peach/20 bg-surface/80 px-4 py-3 backdrop-blur-sm focus:border-peach focus:outline-none"
              whileFocus={{ scale: 1.01, borderColor: "var(--peach)" }}
            />
            <motion.input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
              className="w-full rounded-card border-2 border-peach/20 bg-surface/80 px-4 py-3 backdrop-blur-sm focus:border-peach focus:outline-none"
              whileFocus={{ scale: 1.01, borderColor: "var(--peach)" }}
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
