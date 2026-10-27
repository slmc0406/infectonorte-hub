import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["@napi-rs/canvas", "unpdf"],
  images: { unoptimized: true },
};

export default nextConfig;
