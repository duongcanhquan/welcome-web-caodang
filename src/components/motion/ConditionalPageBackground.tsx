"use client";

import { usePathname } from "next/navigation";
import { PageBackground } from "./PageBackground";

/** Ẩn nền mặc định khi trang có MagicalSkyBackground riêng */
export function ConditionalPageBackground() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/v/")) {
    return null;
  }
  return <PageBackground />;
}
