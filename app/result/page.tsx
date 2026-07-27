import type { Metadata } from "next";
import Link from "next/link";
import { scoreAnswers, getTheme, variantSeed } from "@/lib/typelab-engine";
import { buildResultCopy } from "@/lib/content/select";
import { decodeResult } from "@/lib/share/encode";
import { ogImageFor } from "@/lib/config/og";
import { colorFor } from "@/lib/theme/colors";
import { ResultCard } from "@/components/result/ResultCard";
import { ResultActions } from "@/components/result/ResultActions";
import { ResultTracker } from "@/components/result/ResultTracker";
import { ThemeSwitch } from "@/components/result/ThemeSwitch";
import { CrossPromo } from "@/components/CrossPromo";

/** payload → 유효하면 {theme, code, copy}, 아니면 null. */
function resolve(d?: string) {
  const payload = d ? decodeResult(d) : null;
  if (!payload) return null;
  const theme = getTheme(payload.theme);
  if (!theme) return null;
  try {
    const { code } = scoreAnswers(theme, payload.answers);
    const copy = buildResultCopy(theme.themeId, code, payload.answers);
    return { theme, code, copy, answers: payload.answers };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}): Promise<Metadata> {
  const { d } = await searchParams;
  const r = resolve(d);

  // 결과는 개인 응답 기반이라 색인 제외.
  const base: Metadata = { title: "유형 테스트 결과", robots: { index: false, follow: true } };
  if (!r) return base;

  // H1/OG 는 "캐릭터명(코드)" 병기 (도담 확정: 자기 결과 공유 맥락이라 허용).
  const title = `${r.copy.animal}(${r.code})`;
  const description = `${r.copy.identity} · 타입컷 4문항 유형 테스트`;
  // 도담 정적 카드 우선(없으면 동적 /api/og 폴백). 절대 URL.
  const ogImage = ogImageFor(r.code, d as string);
  return {
    ...base,
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const r = resolve(d);

  if (!r) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="text-ink text-lg font-bold">결과를 불러올 수 없어요</p>
        <p className="text-ink-soft mt-2 text-sm">링크가 손상되었거나 만료된 형식이에요.</p>
        <Link
          href="/"
          className="bg-pop border-ink shadow-popsm mt-6 rounded-xl border-2 px-6 py-3 font-bold text-white"
        >
          다시 테스트하러 가기
        </Link>
      </main>
    );
  }

  const { theme, code, copy, answers } = r;
  const color = colorFor(copy.temperament);
  const seed = variantSeed(theme.themeId, answers);
  const shareTitle = `${copy.animal}(${code})`;
  const shareDesc = "너는 무슨 유형? 4문항 30초 타입컷 ⚡";
  const ogImage = ogImageFor(code, d as string);

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <ResultTracker typeCode={code} />

      <p className="text-ink-faint mb-4 text-center text-xs font-bold">
        {theme.title} · 나의 유형은
      </p>

      <ResultCard copy={copy} />

      {/* 2순위 유형 — 경계 축이 있을 때만 (카드 밖 본문) */}
      {copy.second && (
        <p className="text-ink-soft mx-auto mt-3 max-w-[340px] text-center text-xs leading-relaxed">
          {copy.second.dimension} 축이 거의 반반이라{" "}
          <b className="text-ink">
            {copy.second.animal}({copy.second.code})
          </b>{" "}
          기질도 함께 있어요.
        </p>
      )}

      {/* 테마 맥락 한 줄 */}
      <p
        className="mx-auto mt-5 max-w-[340px] rounded-2xl px-4 py-3 text-center text-sm font-bold"
        style={{ backgroundColor: color.bg, color: color.accent }}
      >
        “{copy.themeComment}”
      </p>

      {/* 특징 3 */}
      <section className="mt-6">
        <h2 className="text-ink-soft text-xs font-bold">이런 편이에요</h2>
        <ul className="mt-2 space-y-2">
          {copy.traits.map((t, i) => (
            <li key={i} className="sticker flex items-center gap-2.5 px-4 py-3 text-sm text-ink">
              <span style={{ color: color.accent }}>●</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 케미 */}
      <section className="mt-6 grid grid-cols-1 gap-2.5">
        <div className="sticker p-4">
          <p className="text-xs font-bold text-emerald-600">💚 잘 맞는 유형 · {copy.chemiMatch.animal}</p>
          <p className="text-ink-soft mt-1 text-sm">{copy.chemiMatch.line}</p>
        </div>
        <div className="sticker p-4">
          <p className="text-xs font-bold text-rose-500">💥 부딪히는 유형 · {copy.chemiClash.animal}</p>
          <p className="text-ink-soft mt-1 text-sm">{copy.chemiClash.line}</p>
        </div>
      </section>

      <ResultActions shareTitle={shareTitle} shareDesc={shareDesc} ogImage={ogImage} />

      <ThemeSwitch currentTheme={theme.themeId} />

      <div className="mt-8">
        <CrossPromo themeId={theme.themeId} seed={seed} />
      </div>

      <p className="text-ink-faint/80 mt-8 text-center text-[11px] leading-relaxed">
        재미로 보는 성향 테스트예요 · 심리검사가 아니에요
        <br />
        개인정보는 저장하지 않으며, 결과는 링크 안에만 담겨요
      </p>
    </main>
  );
}
