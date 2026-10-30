import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    passWithNoTests: false,
    coverage: {
      include: ["src/core/**/*.ts", "src/domain/**/*.ts"],
    },
  },
});

