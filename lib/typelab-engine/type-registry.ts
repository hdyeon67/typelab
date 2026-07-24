// 16유형 레지스트리 (도담 검수 확정 2026-07-24). code ↔ 동물 1:1.
// Phase 1 은 code·animal·oneLiner·temperament 만. traits[3]·chemi 는 Phase 2 확장.

import type { TypeCode, TypeInfo } from "./types";

/** 16유형 본체. 코드는 EI-SN-TF-JP 순서. */
export const TYPES: readonly TypeInfo[] = [
  // NT 분석가 (라벤더)
  { code: "INTJ", animal: "연구소 햄스터", oneLiner: "굴 파고 들어가 판을 다 짜두는 은둔 전략가", temperament: "NT" },
  { code: "INTP", animal: "설계 비버", oneLiner: "'이건 왜?'에 꽂혀 구조를 뜯어보는 설계 덕후", temperament: "NT" },
  { code: "ENTP", animal: "폭풍 부엉이", oneLiner: "새벽에도 토론 스위치가 켜지는 아이디어 발전소", temperament: "NT" },
  { code: "ENTJ", animal: "계획 곰", oneLiner: "목표를 정하면 판을 짜서 끝까지 밀어붙이는 대장", temperament: "NT" },

  // NF 외교관 (민트)
  { code: "INFJ", animal: "이슬 토끼", oneLiner: "말없이 마음을 알아채고 조용히 챙기는 정원사", temperament: "NF" },
  { code: "INFP", animal: "달빛 고양이", oneLiner: "혼자만의 새벽에 감성을 기록하는 몽상 작가", temperament: "NF" },
  { code: "ENFP", animal: "심야 여우", oneLiner: "새벽에 말문이 트이는 텐션 만렙 감성 토크쇼", temperament: "NF" },
  { code: "ENFJ", animal: "산들 카피바라", oneLiner: "모두를 품고 슬쩍 이끄는 다정한 온천 멘토", temperament: "NF" },

  // SJ 관리자 (스카이)
  { code: "ISTJ", animal: "시간표 펭귄", oneLiner: "오늘 할 일을 오늘 끝내는 믿음직한 살림꾼", temperament: "SJ" },
  { code: "ISFJ", animal: "몽글 알파카", oneLiner: "조용히 다정함을 배달하는 꾸준한 지킴이", temperament: "SJ" },
  { code: "ESTJ", animal: "나침반 미어캣", oneLiner: "모두의 일정·정보를 꿰는 팀의 관제탑", temperament: "SJ" },
  { code: "ESFJ", animal: "햇살 앵무새", oneLiner: "매일 같은 텐션으로 분위기를 데우는 공식 호스트", temperament: "SJ" },

  // SP 탐험가 (애프리콧)
  { code: "ISTP", animal: "원칙 거북이", oneLiner: "흔들림 없는 제 페이스로 뚝딱 해내는 실전파 장인", temperament: "SP" },
  { code: "ISFP", animal: "반짝 수달", oneLiner: "꽂히면 새벽까지 만드는 감성 수집가", temperament: "SP" },
  { code: "ESTP", animal: "번개 돌고래", oneLiner: "근거 챙겨 제일 먼저 튀어나가는 추진체", temperament: "SP" },
  { code: "ESFP", animal: "불꽃 리트리버", oneLiner: "시작하면 판을 키우는 분위기 방화범", temperament: "SP" },
];

/** code → TypeInfo 조회 맵. */
export const TYPE_MAP: ReadonlyMap<TypeCode, TypeInfo> = new Map(
  TYPES.map((t) => [t.code, t]),
);

/** 코드로 유형 조회. 없으면 undefined. */
export function getType(code: TypeCode): TypeInfo | undefined {
  return TYPE_MAP.get(code);
}
