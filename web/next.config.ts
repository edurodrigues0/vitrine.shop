import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // Permitir imagens de qualquer origem em desenvolvimento
    // Em produção, considere restringir aos domínios específicos
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
