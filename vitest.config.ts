import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    // tsconfig 의 "@/*" 경로 별칭을 vitest 에도 동일하게 매핑
    alias: [{ find: /^@\//, replacement: `${resolve(root)}/` }],
  },
});
