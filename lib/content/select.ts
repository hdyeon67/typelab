// 결과 문구 조립 (결정적). (themeId, code, answers) → 화면에 뿌릴 ResultCopy.
// 같은 입력이면 항상 같은 변형이 선택된다(공유·재방문 재현성). selectVariant 로 결정.

import type { Answer, TypeCode, TypeInfo } from "@/lib/typelab-engine";
import { getType, selectVariant } from "@/lib/typelab-engine";
import { TYPE_DETAILS } from "./type-detail";
import { THEME_COMMENTS } from "./theme-comments";

export interface ChemiCopy {
  code: TypeCode;
  animal: string;
  line: string;
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
  };
}
