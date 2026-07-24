// 코드 → 폴백 이모지. 캐릭터 PNG 에셋이 없을 때 카드/칩에 쓴다(출시 비차단).
// 실제 에셋(/public/types/{code}.png)이 생기면 이모지는 폴백으로만 남는다.

import type { TypeCode } from "@/lib/typelab-engine";

export const TYPE_EMOJI: Record<TypeCode, string> = {
  INTJ: "🐹", // 연구소 햄스터
  INTP: "🦫", // 설계 비버
  ENTP: "🦉", // 폭풍 부엉이
  ENTJ: "🐻", // 계획 곰
  INFJ: "🐰", // 이슬 토끼
  INFP: "🐱", // 달빛 고양이
  ENFP: "🦊", // 심야 여우
  ENFJ: "🦦", // 산들 카피바라(수달로 대체 표기)
  ISTJ: "🐧", // 시간표 펭귄
  ISFJ: "🦙", // 몽글 알파카
  ESTJ: "🐿️", // 나침반 미어캣(다람쥐로 대체 표기)
  ESFJ: "🦜", // 햇살 앵무새
  ISTP: "🐢", // 원칙 거북이
  ISFP: "🦭", // 반짝 수달(물범으로 대체 표기)
  ESTP: "🐬", // 번개 돌고래
  ESFP: "🐕", // 불꽃 리트리버
};

export function emojiFor(code: TypeCode): string {
  return TYPE_EMOJI[code] ?? "✨";
}
