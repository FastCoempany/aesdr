import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./content/lessons/html/**/*", "./tools/standalone-html/**/*"],
  },
};

export default nextConfig;
