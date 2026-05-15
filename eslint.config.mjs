import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Documentation snapshots / Figma scaffold (not runtime code):
    "design-canon/**",
    "design-canon-seed/**",
    "tools/design-seed/**",
    "**/*.figma.ts",
  ]),
  // Relax strict type rules in e2e tests — Playwright page/window globals
  // are inherently `any`-shaped and forcing specific types adds noise.
  {
    files: ["tests/**/*.ts", "tests/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
    },
  },
]);

export default eslintConfig;
