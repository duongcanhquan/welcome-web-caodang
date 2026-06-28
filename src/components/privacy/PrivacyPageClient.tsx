"use client";

import { FadeIn, GradientText, Stagger, StaggerItem } from "@/components/motion";

export function PrivacyPageClient() {
  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <Stagger className="space-y-4">
        <StaggerItem>
          <GradientText as="h1" className="font-display text-2xl font-bold">
            Chính sách riêng tư
          </GradientText>
        </StaggerItem>
        <StaggerItem>
          <FadeIn delay={0.1} direction="none">
            <p className="text-sm leading-relaxed text-ink-muted">
              Cây Khóa 2026 thu thập ảnh chân dung, họ tên và ngày sinh khi bạn đồng ý
              tham gia. Dữ liệu dùng để tạo lá trên cây tập thể và hiển thị thần số học
              (cho vui & tham khảo). Ảnh lưu trên máy chủ an toàn và có thể được gỡ
              theo yêu cầu qua admin hoặc link cá nhân.
            </p>
          </FadeIn>
        </StaggerItem>
        <StaggerItem>
          <FadeIn delay={0.2} direction="none">
            <p className="text-sm leading-relaxed text-ink-muted">
              Bạn có thể yêu cầu ẩn/gỡ ảnh bất cứ lúc nào bằng cách liên hệ ban tổ
              chức orientation.
            </p>
          </FadeIn>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
