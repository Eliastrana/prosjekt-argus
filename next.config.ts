import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/blog/explain": ["./content/blog/**/*"],
  },
};

export default nextConfig;
