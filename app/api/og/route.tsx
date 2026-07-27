// 동적 OG 이미지 — 링크/카톡 미리보기 + PNG 저장용 유형 카드.
//   next/og(satori) 기반, 외부 키·CDN 불필요. 회사 하드닝 패턴:
//   - 한글 폰트는 public 의 Pretendard KS X 1001 서브셋(337KB) — 모듈 스코프 1회 로드
//   - 캐릭터 PNG 합성 — workerd 실측 확인됨(1.35s). 원본 1024²(1.5MB) 대신
//     public/types/og/{code}.png(512², ~120KB) 를 data URI 로 인라인해 satori 에 넘긴다.
//     받아오기 실패하면 캐릭터만 빼고 렌더(공유·저장이 통째로 깨지지 않게).
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

/**
 * public/ 정적 자산 읽기.
 * Workers 안에서 req.url 은 배포 도메인(typecut.fineboll.com)이라, 그냥 fetch 하면
 * 자기 자신에게 공개 인터넷을 한 바퀴 돈다 — 로컬 프리뷰에선 아직 배포 안 된 파일이
 * 404 나고, 운영에서도 콜드스타트마다 불필요한 왕복이 생긴다.
 * → wrangler.jsonc 의 ASSETS 바인딩으로 직접 읽고, 바인딩이 없는 환경(next dev)에서만
 *   origin fetch 로 폴백한다.
 */
type AssetFetcher = { fetch: (input: URL | string | Request) => Promise<Response> };

async function fetchAsset(path: string, origin: string): Promise<Response | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const assets = (getCloudflareContext().env as { ASSETS?: AssetFetcher }).ASSETS;
    if (assets) {
      const res = await assets.fetch(new URL(path, origin));
      if (res.ok) return res;
    }
  } catch {
    /* 바인딩 없는 환경 → 아래 origin 폴백 */
  }
  try {
    const res = await fetch(new URL(path, origin), { cache: "force-cache" });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

let cachedFont: ArrayBuffer | null = null;
async function loadFont(origin: string): Promise<ArrayBuffer | null> {
  if (cachedFont) return cachedFont;
  const res = await fetchAsset(FONT_PATH, origin);
  if (!res) return null;
  try {
    cachedFont = await res.arrayBuffer();
    return cachedFont;
  } catch {
    return null;
  }
}

/**
 * ArrayBuffer → base64. btoa 는 바이너리 문자열만 받는데, workerd 스택이 얕아
 * String.fromCharCode(...32k) 스프레드는 터진다 → 1KB 씩 잘라 이어붙인다.
 */
function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const CHUNK = 1024;
  let bin = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(bin);
}

// 코드별 캐릭터 data URI. 성공분만 담는다(실패는 캐시하지 않아 다음 요청에 재시도).
const cachedChars = new Map<string, string>();

/** 캐릭터 PNG(512²) 를 data URI 로. 실패하면 null → 캐릭터 없이 렌더. */
async function loadCharacter(origin: string, code: string): Promise<string | null> {
  const key = code.toLowerCase();
  const hit = cachedChars.get(key);
  if (hit) return hit;
  const res = await fetchAsset(`/types/og/${key}.png`, origin);
  if (!res) return null;
  try {
    const uri = `data:image/png;base64,${toBase64(await res.arrayBuffer())}`;
    cachedChars.set(key, uri);
    return uri;
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
  const char = await loadCharacter(req.url, copy.code);

  return new ImageResponse(<TypeCard copy={copy} accent={color.accent} bg={color.bg} scale={s} tall={tall} char={char} />, {
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

/** 확신도 라벨 (퍼센트 미표기) — 카드까지만, 2순위 줄은 카드 밖. */
const CONF_LABEL: Record<string, string> = {
  clear: "뚜렷한 유형",
  balanced: "균형 잡힌 유형",
  edge: "경계에 걸친 유형",
};

function TypeCard({
  copy,
  accent,
  bg,
  scale,
  tall,
  char,
}: {
  copy: ResultCopy;
  accent: string;
  bg: string;
  scale: number;
  tall: boolean;
  /** 캐릭터 data URI. null 이면 캐릭터 없이(기존 타이포만) 렌더. */
  char: string | null;
}) {
  const px = (n: number) => Math.round(n * scale);
  // 세로(3:4)는 캐릭터가 주인공, 가로(1200×630)는 캐릭터 좌 · 텍스트 우 2단.
  const charSize = px(tall ? 430 : 300);

  const info = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: tall ? "center" : "flex-start",
      }}
    >
      <div style={{ display: "flex", fontSize: px(24), color: FAINT, letterSpacing: px(3) }}>
        타입컷 · 나의 유형
      </div>

      <div style={{ display: "flex", alignItems: "center", marginTop: px(16), gap: px(16) }}>
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

      {/* 확신도 뱃지 (라벨만, 퍼센트 없음) */}
      <div
        style={{
          display: "flex",
          marginTop: px(14),
          fontSize: px(22),
          fontWeight: 700,
          color: accent,
          border: `${px(2)}px solid ${accent}`,
          borderRadius: px(999),
          padding: `${px(4)}px ${px(18)}px`,
        }}
      >
        {CONF_LABEL[copy.confidence.level]}
      </div>

      <div
        style={{
          display: "flex",
          textAlign: tall ? "center" : "left",
          marginTop: px(22),
          fontSize: px(32),
          lineHeight: 1.4,
          color: SOFT,
          maxWidth: px(tall ? 680 : 620),
        }}
      >
        {copy.identity}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: px(26),
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
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: bg,
        fontFamily: "Pretendard",
        color: INK,
        padding: px(40),
      }}
    >
      {/* flex:1 로 캔버스를 채운다 — 3:4 에서 카드가 가운데 눌리고 위아래가 비던 문제 */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: tall ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: px(tall ? 8 : 44),
          background: "#ffffff",
          border: `${px(4)}px solid ${INK}`,
          borderRadius: px(28),
          padding: `${px(tall ? 56 : 40)}px ${px(48)}px`,
        }}
      >
        {char ? (
          // 에셋마다 크림 배경이 구워져 있어(코드별로 미묘하게 다름) 흰 패널 위에서
          // 사각 테두리가 도드라진다 → 모서리를 굴려 의도한 타일처럼 보이게.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={char}
            width={charSize}
            height={charSize}
            alt=""
            style={{ flexShrink: 0, borderRadius: px(24) }}
          />
        ) : null}
        {info}
      </div>
    </div>
  );
}
