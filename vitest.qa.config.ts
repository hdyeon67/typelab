import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

// QA 소유 하네스 전용 설정. `npm test`(vitest.config.ts)는 lib/**/*.test.ts 만 본다.
// 알콩과 같은 분리 규칙 — 개발의 테스트와 QA 의 검사를 섞지 않는다.
//   실행: npx vitest run --config vitest.qa.config.ts
export default defineConfig({
  test: {
    environment: "node",
    include: ["qa/**/*.test.ts"],
  },
  resolve: {
    alias: [{ find: /^@\//, replacement: `${resolve(root)}/` }],
  },
});
