"use client";

import { useState } from "react";
import { NumerologyWaitingScreen } from "@/components/waiting/NumerologyWaitingScreen";
import { NumerologyCard } from "@/components/numerology/NumerologyCard";
import { MagicalSkyBackground } from "@/components/motion/MagicalSkyBackground";
import { AnimatedButton } from "@/components/motion";
import { calculateNumerology, getMajorMatchMessage } from "@/lib/numerology";
import { LIFE_PATH_CONTENT } from "@/lib/numerology/content";
import { motion } from "motion/react";
import Link from "next/link";

const DEMO = {
  name: "Nguyễn Minh Anh",
  major: "Ứng Dụng Phần mềm",
  dob: "2008-05-23",
};

export function DemoNumerologyClient() {
  const [phase, setPhase] = useState<"waiting" | "result">("waiting");

  const numerology = calculateNumerology(DEMO.dob);
  const content = LIFE_PATH_CONTENT[numerology.lifePath];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MagicalSkyBackground variant="twilight" className="fixed inset-0 -z-10" />

      {phase === "waiting" && (
        <NumerologyWaitingScreen
          name={DEMO.name}
          minDurationMs={5000}
          onComplete={() => setPhase("result")}
        />
      )}

      {phase === "result" && (
        <motion.div
          className="mx-auto max-w-lg px-4 py-10 pb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-honey">
              Demo xem trước
            </p>
            <h1 className="font-display mt-2 text-2xl font-bold text-white">
              Kết quả Thần số học
            </h1>
          </div>

          <NumerologyCard
            name={DEMO.name}
            major={DEMO.major}
            numerology={numerology}
            content={content}
            aiText="Với Số Đường Đời 11, bạn mang năng lượng trực giác mạnh — rất hợp với ngành CNTT nơi cần tư duy sáng tạo và kiên nhẫn. Khóa 2026 sẽ là năm bạn bứt phá nếu dám thử thách bản thân!"
            wishComment="Ước mơ trở thành lập trình viên của bạn đang trên đúng quỹ đạo."
            funFact="Số 11 được gọi là 'Master Number' — chỉ khoảng 2% dân số mang năng lượng này!"
            majorMatch={getMajorMatchMessage(numerology.lifePath, DEMO.major)}
            reveal
          />

          <div className="mt-8 flex flex-col gap-3">
            <AnimatedButton href="/demo/tree?present=1" variant="primary" className="w-full text-center">
              Xem cây demo hoàn chỉnh 🌳
            </AnimatedButton>
            <Link
              href="/demo/tree"
              className="block text-center text-sm text-white/70 underline"
            >
              Hoặc xem cây có header tìm tên
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
