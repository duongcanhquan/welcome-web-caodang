"use client";

import { usePathname } from "next/navigation";
import { PageBackground } from "./PageBackground";

/** Ẩn nền mặc định khi trang có MagicalSkyBackground riêng */
export function ConditionalPageBackground() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/v/") ||
    pathname.startsWith("/live/") ||
    pathname.startsWith("/demo/") ||
    pathname.startsWith("/me/")
  ) {
    return null;
  }
  return <PageBackground />;
}
