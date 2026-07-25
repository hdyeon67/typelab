// 4개 성향 축의 정의(친근 라벨 + 코드 글자)와 코드 관련 헬퍼.

import type { Axis, AxisDef, Pole, Temperament, TypeCode } from "./types";
import { AXES } from "./types";

/**
 * 4축 정의. first = 답 0(E/S/T/J 극), second = 답 1(I/N/F/P 극).
 * UI 는 친근 라벨(발전기/배터리 …)을 앞세우고 코드 글자는 보조로 쓴다.
 */
export const AXIS_DEFS: Record<Axis, AxisDef> = {
  EI: {
    axis: "EI",
    dimension: "에너지",
    first: { letter: "E", label: "발전기" }, // 사람에게서 충전
    second: { letter: "I", label: "배터리" }, // 혼자 충전
  },
  SN: {
    axis: "SN",
    dimension: "인식",
    first: { letter: "S", label: "돋보기" }, // 현실·사실 그대로
    second: { letter: "N", label: "상상펜" }, // 의미·상상 먼저
  },
  TF: {
    axis: "TF",
    dimension: "결정",
    first: { letter: "T", label: "계산기" }, // 기준·논리
    second: { letter: "F", label: "공감력" }, // 마음·분위기
  },
  JP: {
    axis: "JP",
    dimension: "리듬",
    first: { letter: "J", label: "플래너" }, // 미리 계획
    second: { letter: "P", label: "즉흥러" }, // 그때그때
  },
};

/** 축의 두 극 글자를 [first, second] 순서로 반환. */
export function polesOf(axis: Axis): [Pole, Pole] {
  const def = AXIS_DEFS[axis];
  return [def.first.letter, def.second.letter];
}

/** 4점 답(0~3)을 해당 축의 극 글자로 변환. 0·1 → first(E/S/T/J), 2·3 → second(I/N/F/P). */
export function poleForAnswer(axis: Axis, answer: number): Pole {
  const def = AXIS_DEFS[axis];
  return answer <= 1 ? def.first.letter : def.second.letter;
}

/** 답의 강도. 0/3(완전) → 1(강), 1/2(약간) → 0(약). */
export function strengthOf(answer: number): 0 | 1 {
  return answer === 0 || answer === 3 ? 1 : 0;
}

/** 축 반대 극 글자 (코드 한 글자 뒤집기용). */
const POLE_FLIP: Record<Pole, Pole> = {
  E: "I", I: "E", S: "N", N: "S", T: "F", F: "T", J: "P", P: "J",
};
export function flipPole(pole: Pole): Pole {
  return POLE_FLIP[pole];
}

/**
 * 4글자 코드로부터 4기질(NT/NF/SJ/SP)을 도출.
 * N → 결정축(T/F)으로 NT/NF, S → 리듬축(J/P)으로 SJ/SP.
 * 코드 위치: [0]=E/I, [1]=S/N, [2]=T/F, [3]=J/P.
 */
export function temperamentOf(code: TypeCode): Temperament {
  const perception = code[1]; // S | N
  const decision = code[2]; // T | F
  const rhythm = code[3]; // J | P
  if (perception === "N") {
    return decision === "T" ? "NT" : "NF";
  }
  return rhythm === "J" ? "SJ" : "SP";
}

/** AXES 를 다시 내보내 배럴 없이도 축 순서를 쓸 수 있게 한다. */
export { AXES };
