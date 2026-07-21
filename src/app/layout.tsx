import type { Metadata, Viewport } from "next";
import { Nunito, Outfit } from "next/font/google";
import { ConditionalPageBackground } from "@/components/motion/ConditionalPageBackground";
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
  title: "WELCOME NEW LYONS — Việt Mỹ College",
  description:
    "Orientation Cao đẳng Việt Mỹ — Gửi ảnh, nhận bất ngờ và xem thần số học của bạn.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
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
        <ConditionalPageBackground />
        {children}
      </body>
    </html>
  );
}
