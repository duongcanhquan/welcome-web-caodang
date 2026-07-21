import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tránh cảnh báo turbopack root khi có lockfile ở thư mục cha
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "img.cay.vietmycollege.com",
      },
      {
        protocol: "https",
        hostname: "img.welcome.vietmycollege.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
};

export default nextConfig;
