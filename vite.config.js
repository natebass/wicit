import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { defineConfig, loadEnv } from "vite-plus";

/**
 * Vite configuration with Vite+.
 */
export default defineConfig(({ mode }) => {
  const dist = parseEnv(readFileSync(new URL(".env.dist", import.meta.url), "utf-8"));
  const local = loadEnv(mode, process.cwd());
  const merged = { ...dist, ...local };
  return {
    base: process.env.BASE_PATH ? `${process.env.BASE_PATH.replace(/\/$/, "")}/` : "/",
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
