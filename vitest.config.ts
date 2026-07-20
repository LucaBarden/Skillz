import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "skillz": path.resolve(__dirname, "src"),
      "@skillz/shared": path.resolve(__dirname, "packages/shared/src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
