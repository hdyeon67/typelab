// 결과 문구 조립 (결정적). (themeId, code, answers) → 화면에 뿌릴 ResultCopy.
// 같은 입력이면 항상 같은 변형이 선택된다(공유·재방문 재현성). selectVariant 로 결정.

import type { Answer, ConfidenceLevel, TypeCode, TypeInfo } from "@/lib/typelab-engine";
import { getType, selectVariant, computeConfidence, secondCode, AXIS_DEFS } from "@/lib/typelab-engine";
import { TYPE_DETAILS } from "./type-detail";
import { THEME_COMMENTS } from "./theme-comments";

export interface ChemiCopy {
  code: TypeCode;
  animal: string;
  line: string;
}

/** 2순위 유형(경계 축이 있을 때). */
export interface SecondCopy {
  code: TypeCode;
  animal: string;
  /** 반반인 축의 차원명(에너지/인식/결정/리듬). */
  dimension: string;
}

export interface ResultCopy {
  code: TypeCode;
  animal: string;
  temperament: TypeInfo["temperament"];
  /** 선택된 정체성 한 줄. */
  identity: string;
  /** 선택된 특징 3개. */
  traits: string[];
  /** 테마 맥락 한 줄. */
  themeComment: string;
  chemiMatch: ChemiCopy;
  chemiClash: ChemiCopy;
  /** 확신도(라벨·강축 수). 퍼센트는 쓰지 않는다. */
  confidence: { level: ConfidenceLevel; strongCount: number };
  /** 경계 축이 있으면 2순위 유형, 없으면 null. */
  second: SecondCopy | null;
}

/** code → 캐릭터명. 없으면 코드 그대로. */
function animalOf(code: TypeCode): string {
  return getType(code)?.animal ?? code;
}

/**
 * 결과 문구 조립. 존재하지 않는 코드면 throw.
 * answers 는 변형 시드용 — 같은 코드라도 답안열이 다르면 문구가 살짝 달라진다.
 */
export function buildResultCopy(
  themeId: string,
  code: TypeCode,
  answers: readonly Answer[],
): ResultCopy {
  const info = getType(code);
  const detail = TYPE_DETAILS[code];
  if (!info || !detail) throw new Error(`알 수 없는 유형 코드: ${code}`);

  const identityIdx = selectVariant(themeId, answers, detail.identities.length, "identity");
  const traitIdx = selectVariant(themeId, answers, detail.traitSets.length, "traits");

  const comments = THEME_COMMENTS[themeId]?.[code] ?? THEME_COMMENTS.base[code];
  const commentIdx = selectVariant(themeId, answers, comments.length, "theme");

  // 확신도 + 2순위 유형 (v2.1). 강/약은 코드에 영향 없음.
  const conf = computeConfidence(answers);
  const weakAxis = conf.perAxis.find((a) => !a.strong)?.axis ?? null;
  const secCode = secondCode(code, answers);
  const second: SecondCopy | null =
    secCode && weakAxis
      ? { code: secCode, animal: animalOf(secCode), dimension: AXIS_DEFS[weakAxis].dimension }
      : null;

  return {
    code,
    animal: info.animal,
    temperament: info.temperament,
    identity: detail.identities[identityIdx],
    traits: detail.traitSets[traitIdx],
    themeComment: comments[commentIdx],
    chemiMatch: {
      code: detail.chemi.match,
      animal: animalOf(detail.chemi.match),
      line: detail.chemi.matchLine,
    },
    chemiClash: {
      code: detail.chemi.clash,
      animal: animalOf(detail.chemi.clash),
      line: detail.chemi.clashLine,
    },
    confidence: { level: conf.level, strongCount: conf.strongCount },
    second,
  };
}
