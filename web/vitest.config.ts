import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/stubs/empty.ts"),
    },
  },
  esbuild: { jsx: "automatic" },
  oxc: { jsx: { runtime: "automatic" } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
