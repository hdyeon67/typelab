// 동적 OG 이미지 — 링크/카톡 미리보기 + PNG 저장용 유형 카드.
//   next/og(satori) 기반, 외부 키·CDN 불필요. 회사 하드닝 패턴:
//   - 한글 폰트는 public 의 Pretendard KS X 1001 서브셋(337KB) — 모듈 스코프 1회 로드
//   - Workers 에선 이미지 합성 불가 → 타이포 + 틀 + 기질 가족색만 (캐릭터 PNG 미합성)
//   - Cache API 로 d(결과)별 1회만 렌더 후 엣지 캐시
//   ※ 서브셋 폰트엔 이모지 글리프가 없어 이모지는 넣지 않는다(두부 방지).
//   fmt: og(1200×630 링크) · card(900×1200 3:4 저장) · home(1200×630)

import { ImageResponse } from "next/og";
import { decodeResult } from "@/lib/share/encode";
import { scoreAnswers, getTheme } from "@/lib/typelab-engine";
import { buildResultCopy, type ResultCopy } from "@/lib/content/select";
import { TEMPERAMENT_COLORS } from "@/lib/theme/colors";

export const runtime = "nodejs";

const FONT_PATH = "/fonts/pretendard-kr-subset.ttf";
const INK = "#2c2a3a";
const FAINT = "#8f8ca0";
const SOFT = "#5a5768";

const SIZES: Record<string, { w: number; h: number }> = {
  og: { w: 1200, h: 630 },
  card: { w: 900, h: 1200 },
  home: { w: 1200, h: 630 },
};

let cachedFont: ArrayBuffer | null = null;
async function loadFont(origin: string): Promise<ArrayBuffer | null> {
  if (cachedFont) return cachedFont;
  try {
    const res = await fetch(new URL(FONT_PATH, origin), { cache: "force-cache" });
    if (!res.ok) return null;
    cachedFont = await res.arrayBuffer();
    return cachedFont;
  } catch {
    return null;
  }
}

const OG_HEADERS = {
  "Cache-Control": "public, immutable, no-transform, max-age=31536000, s-maxage=31536000",
};

export async function GET(req: Request): Promise<Response> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const cacheKey = new Request(new URL(req.url).toString(), { method: "GET" });

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const res = await render(req);

  if (cache && res.ok) {
    try {
      await cache.put(cacheKey, res.clone());
    } catch {
      /* 캐시 저장 실패 무시 */
    }
  }
  return res;
}

function resolveCopy(d: string | null): ResultCopy | null {
  const payload = d ? decodeResult(d) : null;
  if (!payload) return null;
  const theme = getTheme(payload.theme);
  if (!theme) return null;
  try {
    const { code } = scoreAnswers(theme, payload.answers);
    return buildResultCopy(theme.themeId, code, payload.answers);
  } catch {
    return null;
  }
}

async function render(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get("d");
  const fmt = searchParams.get("fmt") ?? "og";
  const { w, h } = SIZES[fmt] ?? SIZES.og;

  const font = await loadFont(req.url);
  const fonts = font
    ? [
        { name: "Pretendard", data: font, weight: 400 as const, style: "normal" as const },
        { name: "Pretendard", data: font, weight: 700 as const, style: "normal" as const },
      ]
    : undefined;

  const copy = resolveCopy(d);

  if (!copy) {
    return new ImageResponse(<BrandCard scale={w / 1200} />, {
      width: w,
      height: h,
      fonts,
      headers: OG_HEADERS,
    });
  }

  const color = TEMPERAMENT_COLORS[copy.temperament];
  const tall = h > w;
  const s = tall ? w / 900 : w / 1200;

  return new ImageResponse(<TypeCard copy={copy} accent={color.accent} bg={color.bg} scale={s} tall={tall} />, {
    width: w,
    height: h,
    fonts,
    headers: OG_HEADERS,
  });
}

function BrandCard({ scale }: { scale: number }) {
  const px = (n: number) => Math.round(n * scale);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#fff6e9",
        padding: px(48),
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: `${px(4)}px solid ${INK}`,
          borderRadius: px(28),
          padding: `${px(56)}px ${px(64)}px`,
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: px(30), color: "#f26a3a", letterSpacing: px(4) }}>
          가장 빠른 유형 테스트
        </div>
        <div style={{ display: "flex", fontSize: px(120), fontWeight: 700, color: INK, marginTop: px(14) }}>
          타입컷
        </div>
        <div style={{ display: "flex", fontSize: px(40), color: SOFT, marginTop: px(20) }}>
          검사 30분? 여긴 4문항 30초.
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            marginTop: px(30),
            border: `${px(4)}px solid ${INK}`,
            borderRadius: px(999),
            padding: `${px(12)}px ${px(28)}px`,
            fontSize: px(30),
            fontWeight: 700,
            color: "#f26a3a",
          }}
        >
          typecut.fineboll.com
        </div>
      </div>
    </div>
  );
}

function TypeCard({
  copy,
  accent,
  bg,
  scale,
  tall,
}: {
  copy: ResultCopy;
  accent: string;
  bg: string;
  scale: number;
  tall: boolean;
}) {
  const px = (n: number) => Math.round(n * scale);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        fontFamily: "Pretendard",
        color: INK,
        padding: px(40),
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          background: "#ffffff",
          border: `${px(4)}px solid ${INK}`,
          borderRadius: px(28),
          padding: `${px(tall ? 64 : 40)}px ${px(48)}px`,
        }}
      >
        <div style={{ display: "flex", fontSize: px(24), color: FAINT, letterSpacing: px(3) }}>
          타입컷 · 나의 유형
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: px(20), gap: px(16) }}>
          <div style={{ display: "flex", fontSize: px(tall ? 76 : 68), fontWeight: 700, color: INK }}>
            {copy.animal}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: px(34),
              fontWeight: 700,
              color: "#ffffff",
              background: accent,
              borderRadius: px(12),
              padding: `${px(6)}px ${px(18)}px`,
            }}
          >
            {copy.code}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            textAlign: "center",
            marginTop: px(24),
            fontSize: px(32),
            lineHeight: 1.4,
            color: SOFT,
            maxWidth: px(tall ? 700 : 900),
          }}
        >
          {copy.identity}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: px(30),
            border: `${px(3)}px solid ${accent}`,
            borderRadius: px(999),
            padding: `${px(10)}px ${px(26)}px`,
            fontSize: px(26),
            fontWeight: 700,
            color: accent,
          }}
        >
          4문항 30초 · typecut.fineboll.com
        </div>
      </div>
    </div>
  );
}
