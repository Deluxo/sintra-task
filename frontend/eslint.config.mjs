import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import tailwindcss from "eslint-plugin-tailwindcss";
import allowedSpacing from "./eslint-rules/allowed-spacing.js";

export default defineConfig(
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      tailwindcss,
      style: { rules: { "allowed-spacing": allowedSpacing } },
    },
    settings: {
      tailwindcss: {
        cssConfigPath: "./src/app/globals.css",
      },
    },
    rules: {
      "tailwindcss/no-arbitrary-value": "error",
      "tailwindcss/no-contradicting-classname": "error",
      "tailwindcss/enforces-canonical-classname": "error",
      "style/allowed-spacing": "error",
    },
  },
  {
    files: ["src/components/atom/**/*.tsx"],
    rules: { "style/allowed-spacing": "off" },
  }
);
