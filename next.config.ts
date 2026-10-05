import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  serverExternalPackages: [],
  // @ts-ignore - for Next 14/15 dev origin bypass
  allowedDevOrigins: ["kveriai.aiforus.co.kr"],
};

export default nextConfig;
