import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 모든 외부 도메인 허용 (테스트 단계)
      },
    ],
  },
};

export default nextConfig;
