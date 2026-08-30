import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { defineConfig, loadEnv } from "vite-plus";

/**
 * Vite configuration with Vite+.
 * Override the base path so that it works on GitHub Pages (relative URL)
 * and a custom domain (root URL).
 * The environment variables are read from .env.dist and .env, with .env taking priority.
 */
export default defineConfig(({ mode }) => {
  const dist = parseEnv(readFileSync(new URL(".env.dist", import.meta.url), "utf-8"));
  const local = loadEnv(mode, process.cwd());
  const merged = { ...dist, ...local };
  return {
    base: process.env.BASE_PATH ? `${process.env.BASE_PATH.replace(/\/$/, "")}/` : "/",
    build: {
      target: ["es2021", "safari16", "chrome107", "firefox104"],
    },
    define: Object.fromEntries(
      Object.entries(merged)
        .filter(([key]) => key.startsWith("VITE_"))
        .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
    ),
    staged: {
      "*": "vp check --fix",
    },
    fmt: {},
    lint: {
      jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
      rules: { "vite-plus/prefer-vite-plus-imports": "error" },
      options: { typeAware: false, typeCheck: false },
    },
  };
});
