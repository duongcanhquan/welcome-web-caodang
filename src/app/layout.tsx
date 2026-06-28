import type { Metadata, Viewport } from "next";
import { Nunito, Outfit } from "next/font/google";
import { PageBackground } from "@/components/motion/PageBackground";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cây Khóa 2026 — Việt Mỹ College",
  description:
    "Mỗi sinh viên là một chiếc lá — cùng nhau làm trường nở rộ. Trạm công nghệ ngày orientation Cao đẳng Việt Mỹ.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffbf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${nunito.variable} ${outfit.variable} h-full`}>
      <body className="relative min-h-full flex flex-col antialiased">
        <PageBackground />
        {children}
      </body>
    </html>
  );
}
