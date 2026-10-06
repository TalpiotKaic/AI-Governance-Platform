import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Hosts allowed to load Next.js dev resources (e.g. through a Cloudflare Tunnel). Extend via NEXT_ALLOWED_DEV_ORIGINS="a.example,b.example".
  allowedDevOrigins: ["kveriai.aiforus.co.kr", ...(process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [])],
};

export default nextConfig;
