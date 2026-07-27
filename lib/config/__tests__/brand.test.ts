// 브랜드 색 드리프트 가드 — 토큰(lib/config/brand.ts)을 import 할 수 없는 정적 파일들이
// 계단에서 벗어나지 않는지 검사한다. 새 값을 하드코딩하면 여기서 먼저 깨진다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND, CREAM, INK } from "../brand";

const root = resolve(__dirname, "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const hexes = (s: string) => (s.match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((h) => h.toLowerCase());
const LADDER = Object.values(BRAND).map((v) => v.toLowerCase());

const lum = (h: string) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};

describe("브랜드 계단", () => {
  it("밝음 → 어두움 순서다", () => {
    expect(lum(BRAND.light)).toBeGreaterThan(lum(BRAND.deep));
    expect(lum(BRAND.deep)).toBeGreaterThan(lum(BRAND.dark));
  });

  it("3단이 서로 다른 값이다", () => {
    expect(new Set(LADDER).size).toBe(3);
  });
});

describe("정적 파일 미러 (import 불가 → 값 일치 검사)", () => {
  it("app/icon.svg 배경 fill = BRAND.dark", () => {
    const bg = read("app/icon.svg").match(/<rect[^>]*fill="(#[0-9a-fA-F]{6})"/);
    expect(bg?.[1]?.toLowerCase()).toBe(BRAND.dark.toLowerCase());
  });

  it("app/globals.css 의 --pop 계열 = 계단과 일치", () => {
    const css = read("app/globals.css");
    const v = (name: string) =>
      css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]?.toLowerCase();
    expect(v("pop")).toBe(BRAND.light.toLowerCase());
    expect(v("pop-deep")).toBe(BRAND.deep.toLowerCase());
    expect(v("pop-dark")).toBe(BRAND.dark.toLowerCase());
    expect(v("cream")).toBe(CREAM.toLowerCase());
    expect(v("ink")).toBe(INK.toLowerCase());
  });

  it("globals 의 --primary(HSL) 가 BRAND.light 와 같은 색이다", () => {
    const m = read("app/globals.css").match(/--primary:\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
    expect(m).toBeTruthy();
    const [h, s, l] = m!.slice(1).map(Number);
    // HSL → RGB (드리프트가 헥스가 아니라 HSL 로 숨는 걸 막는다)
    const c = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m2 = l / 100 - c / 2;
    const seg = [
      [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
    ][Math.floor((h % 360) / 60)];
    const hex =
      "#" + seg.map((v) => Math.round((v + m2) * 255).toString(16).padStart(2, "0")).join("");
    expect(hex).toBe(BRAND.light.toLowerCase());
  });
});

describe("하드코딩된 브랜드색 없음", () => {
  const FILES = ["app/manifest.ts", "tailwind.config.ts", "app/layout.tsx"];
  for (const f of FILES) {
    it(`${f} — 계단 값 직접 표기 0건`, () => {
      expect(hexes(read(f)).filter((h) => LADDER.includes(h))).toEqual([]);
    });
  }
});
