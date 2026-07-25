// typelab 도메인 타입.
//
// 4개 성향 축(EI·SN·TF·JP) 각각을 문항 하나로 물어 4글자 "성향 코드" 를 만든다.
// ⚠️ 이 코드베이스 어디에도 특정 성격유형 검사의 상표명을 쓰지 않는다. "성향 코드"·"유형" 으로만 부른다.

/** 4개 성향 축. 코드 조립 순서와 동일하게 EI → SN → TF → JP. */
export type Axis = "EI" | "SN" | "TF" | "JP";

/** 코드 조립 고정 순서. 문항 순서와 무관하게 항상 이 순서로 글자를 이어붙인다. */
export const AXES: readonly Axis[] = ["EI", "SN", "TF", "JP"] as const;

/** 축의 한쪽 극을 나타내는 한 글자. */
export type Pole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

/** 4글자 성향 코드 (예: "ENFP"). */
export type TypeCode = string;

/** 4기질 그룹 (색·가족 라벨의 근거). */
export type Temperament = "NT" | "NF" | "SJ" | "SP";

/**
 * 4점 리커트 답.
 *  0 = 완전 first(E/S/T/J), 1 = 약간 first, 2 = 약간 second, 3 = 완전 second(I/N/F/P).
 * 방향(코드 글자)은 first/second 로만 결정되고(0·1→first, 2·3→second), 강/약은 확신도에만 쓰인다.
 */
export type Answer = 0 | 1 | 2 | 3;

/** 확신도 수준. clear=뚜렷 / balanced=균형 / edge=경계. */
export type ConfidenceLevel = "clear" | "balanced" | "edge";

/** 축별 확신도(방향 극 + 강/약). */
export interface AxisConfidence {
  axis: Axis;
  pole: Pole;
  /** 완전(0/3) 응답이면 true. */
  strong: boolean;
}

/** 축 한쪽 극의 정의(글자 + 친근 라벨). */
export interface PoleDef {
  letter: Pole;
  /** 친근 라벨. 예: 발전기 / 배터리. */
  label: string;
}

/** 한 축의 정의. first = 답 0(E/S/T/J), second = 답 1(I/N/F/P). */
export interface AxisDef {
  axis: Axis;
  /** 축이 다루는 성향 차원의 이름. 예: 에너지 / 인식 / 결정 / 리듬. */
  dimension: string;
  first: PoleDef;
  second: PoleDef;
}

/**
 * 테마 문항 하나. 정확히 축 1개의 방향을 결정한다.
 * 리커트 눈금의 좌우 앵커 문구를 담는다: optFirst=first 극(답 0·1), optSecond=second 극(답 2·3).
 */
export interface ThemeQuestion {
  axis: Axis;
  prompt: string;
  /** 왼쪽 앵커 — first 극(E/S/T/J). 답 0(완전)·1(약간). */
  optFirst: string;
  /** 오른쪽 앵커 — second 극(I/N/F/P). 답 2(약간)·3(완전). */
  optSecond: string;
}

/**
 * 테마. 축(EI·SN·TF·JP)마다 문항을 2~3개씩 "풀"로 가진다.
 * 각 축 배열의 모든 문항 axis 는 그 키와 일치해야 한다(validateTheme 로 검증).
 * 응시 때 축당 1개씩 뽑아 4문항을 구성하되(buildQuestionSet), 채점은 제시 변형과
 * 무관하게 축 순서(answers[i] = AXES[i])로만 결정된다 — 결과 재현성 보존.
 */
export interface Theme {
  themeId: string;
  title: string;
  pool: Record<Axis, ThemeQuestion[]>;
}

/**
 * 16유형 본체 레지스트리 항목. Phase 1 은 code·animal·oneLiner·temperament 만 확정.
 * traits[3]·chemi(잘 맞는/부딪히는) 는 Phase 2 에서 확장한다.
 */
export interface TypeInfo {
  code: TypeCode;
  /** 자체 캐릭터명. 예: 심야 여우. */
  animal: string;
  /** 한 줄 정체성. */
  oneLiner: string;
  temperament: Temperament;
}

/** 채점 결과. */
export interface ScoreResult {
  code: TypeCode;
  temperament: Temperament;
}
