// 크로스 프로모션 (docs/cross-promo-spec.md 준수 — 최대 2슬롯).
//   1번 슬롯 = 맥락 매칭: 연애 테마 → 케미체크, 시험 테마 → 행운부적.
//   2번 슬롯 = 시드 로테이션: 퀴즈 클러스터(문해력·신조어).
// 앱이 늘면 APPS 에 항목만 추가. href 는 안정 커스텀 도메인(fineboll.com 서브도메인).

export interface PromoApp {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  href: string;
  /** 배너 배경 힌트 컬러 */
  color: string;
}

const APPS: Record<string, PromoApp> = {
  chemicheck: {
    id: "chemicheck",
    emoji: "💘",
    title: "우리 궁합도 볼까?",
    desc: "케미체크로 둘 사이 케미 진단",
    href: "https://chemicheck.fineboll.com",
    color: "#ff5fa2",
  },
  bujeok: {
    id: "bujeok",
    emoji: "🍀",
    title: "시험엔 부적 하나",
    desc: "행운부적으로 오늘의 합격 기운 충전",
    href: "https://bujeok.fineboll.com",
    color: "#54b56a",
  },
  munhae: {
    id: "munhae",
    emoji: "📝",
    title: "문해력도 궁금하다면?",
    desc: "오늘의 시험지 10문항, 내 문해력 등급은",
    href: "https://munhae.fineboll.com",
    color: "#3f7fdd",
  },
  shinjo: {
    id: "shinjo",
    emoji: "🔍",
    title: "내 언어 나이는?",
    desc: "신조어 판독기로 언어 나이 대결",
    href: "https://shinjo.fineboll.com",
    color: "#7c6cff",
  },
};

/**
 * 테마 맥락 + 시드 로테이션으로 최대 2개 배너를 고른다.
 * seed 는 결과 답안 해시 등 결정적 정수(같은 결과 → 같은 배너).
 */
export function promosFor(themeId: string, seed: number): PromoApp[] {
  const quiz = [APPS.munhae, APPS.shinjo];
  const rotated = (seed >>> 0) % 2 === 0 ? quiz : [quiz[1], quiz[0]];

  let slot1: PromoApp;
  if (themeId === "love") slot1 = APPS.chemicheck;
  else if (themeId === "exam") slot1 = APPS.bujeok;
  else slot1 = rotated[0];

  const out: PromoApp[] = [slot1];
  for (const q of rotated) {
    if (out.length >= 2) break;
    if (!out.some((p) => p.id === q.id)) out.push(q);
  }
  return out.slice(0, 2);
}
