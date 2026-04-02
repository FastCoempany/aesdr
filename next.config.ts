import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, ".."),
  outputFileTracingIncludes: {
    "/*": ["../content/lessons/html/**/*", "../tools/standalone-html/**/*"],
  },
};

export default nextConfig;
