// 테마 카탈로그. 각 테마는 축(EI·SN·TF·JP)마다 문항 풀(2~3개)을 가진다.
// 응시 때 축당 1개씩 뽑아 4문항을 구성(buildQuestionSet)하되, 제시는 항상 축 순서.
// 채점은 제시 변형과 무관하게 축 순서로만 결정 → 결과 재현성 보존(score.ts).
//
// ⚠️ 모든 문항은 자체 창작본이다. 어떤 외부 성격유형 검사의 문구도 복제하지 않는다.
// 신규 변형은 docs/typelab-v2-questionpool-patch-2026-07-24.md 표 그대로.

import type { Axis, Theme, ThemeQuestion } from "./types";
import { AXES } from "./types";

/** 기본 테마: 요즘 나 사용설명서 (범용 첫 진입점). */
export const BASE_THEME: Theme = {
  themeId: "base",
  title: "요즘 나 사용설명서",
  pool: {
    EI: [
      {
        axis: "EI",
        prompt: "주말이 통째로 비었다. 뭐가 더 충전돼?",
        optFirst: "사람들 불러 모아서 뭐라도 벌인다",
        optSecond: "알림 다 끄고 나만의 소굴에서 논다",
      },
      {
        axis: "EI",
        prompt: "처음 가는 모임에 딱 도착했어. 첫 30분 너는?",
        optFirst: "아무나 붙잡고 말 트며 분위기 익힌다",
        optSecond: "익숙한 한 명 옆에 자리 잡고 천천히 본다",
      },
    ],
    SN: [
      {
        axis: "SN",
        prompt: "잠이 안 와서 양을 세기로 했어. 네 머릿속 양은?",
        optFirst: "그냥 한 마리, 두 마리… 숫자만 또박또박 센다",
        optSecond: "울타리를 폴짝폴짝 넘는 양이 눈앞에 그려진다",
      },
      {
        axis: "SN",
        prompt: "새 카페에 들어섰어. 먼저 들어오는 건?",
        optFirst: "메뉴·가격·빈자리 같은 정보가 딱딱 보인다",
        optSecond: "'여기 분위기 영화 같다' 느낌이 먼저 온다",
      },
    ],
    TF: [
      {
        axis: "TF",
        prompt: "친구가 '나 요즘 너무 힘들어'라고 털어놨어. 먼저 튀어나오는 말은?",
        optFirst: "왜? 뭐 때문인데? 같이 방법을 찾아보자",
        optSecond: "헐 무슨 일이야ㅠㅠ 많이 힘들었겠다",
      },
      {
        axis: "TF",
        prompt: "친구가 충동적으로 큰 결정을 했대. 첫 반응은?",
        optFirst: "장단점부터 같이 따져본다",
        optSecond: "네가 좋다면 응원해, 마음부터 살핀다",
      },
    ],
    JP: [
      {
        axis: "JP",
        prompt: "갑자기 떠나는 여행. 네 스타일은?",
        optFirst: "동선·맛집·시간표 이미 정리 끝났다",
        optSecond: "일단 가서 발길 닿는 대로, 그때그때 정하지",
      },
      {
        axis: "JP",
        prompt: "조별 과제가 떨어졌어. 너는?",
        optFirst: "역할·마감 정해 계획표부터 만든다",
        optSecond: "일단 아이디어 던지며 흐름 따라간다",
      },
    ],
  },
};

/** 연애 유형 테마 (케미체크 크로스). 같은 4축을 연애 상황으로 묻는다. */
export const LOVE_THEME: Theme = {
  themeId: "love",
  title: "내 연애 유형",
  pool: {
    EI: [
      {
        axis: "EI",
        prompt: "썸이든 연애든, 네 애정 배터리는 어떻게 차?",
        optFirst: "매일 붙어서 뭐든 같이 할 때 꽉 찬다",
        optSecond: "각자 시간도 꼭 필요, 붙었다 떨어졌다 해야 편하다",
      },
      {
        axis: "EI",
        prompt: "연애 중 주말, 이상적인 하루는?",
        optFirst: "같이 나가서 이것저것 하고 사람도 만난다",
        optSecond: "둘이 집에서 뒹굴뒹굴 조용히 붙어 있는다",
      },
    ],
    SN: [
      {
        axis: "SN",
        prompt: "상대가 날 좋아하는지, 넌 어떻게 확신해?",
        optFirst: "연락·챙김 같은 확실한 행동으로 안다",
        optSecond: "말 안 해도 눈빛·분위기에서 느낌이 온다",
      },
      {
        axis: "SN",
        prompt: "상대의 'ㅇㅇ' 답장, 넌 어떻게 읽어?",
        optFirst: "바쁜가 보다, 말 그대로 받아들인다",
        optSecond: "혹시 서운한가? 숨은 뉘앙스를 상상한다",
      },
    ],
    TF: [
      {
        axis: "TF",
        prompt: "연인이랑 다퉜다. 네가 먼저 하는 건?",
        optFirst: "뭐가 문제였는지 짚고 해결책부터 찾는다",
        optSecond: "서운했던 마음부터 알아주길 바란다",
      },
      {
        axis: "TF",
        prompt: "연인이 고민을 털어놨어. 주고 싶은 건?",
        optFirst: "현실적인 해결책과 방향",
        optSecond: "괜찮다는 공감과 든든한 편들기",
      },
    ],
    JP: [
      {
        axis: "JP",
        prompt: "기념일 데이트, 네 준비 스타일은?",
        optFirst: "코스·맛집·예약 미리 완벽하게 짜둔다",
        optSecond: "그날 기분 따라 발길 닿는 대로 즐긴다",
      },
      {
        axis: "JP",
        prompt: "데이트 당일 비가 쏟아진다. 너는?",
        optFirst: "준비해둔 실내 플랜 B로 바로 전환",
        optSecond: "오히려 좋아, 즉흥으로 새 코스 찾는다",
      },
    ],
  },
};

/** 시험기간 유형 테마 (행운부적 크로스, 수능 시즌 훅). 같은 4축을 공부 상황으로 묻는다. */
export const EXAM_THEME: Theme = {
  themeId: "exam",
  title: "시험기간 나는",
  pool: {
    EI: [
      {
        axis: "EI",
        prompt: "시험 3주 전. 어디서 공부해야 잘돼?",
        optFirst: "친구랑 카페·스터디, 같이 해야 엔진이 돈다",
        optSecond: "혼자 독서실·내 방, 조용해야 집중이 된다",
      },
      {
        axis: "EI",
        prompt: "시험 끝난 직후, 너는?",
        optFirst: "친구들이랑 바로 만나서 푼다",
        optSecond: "혼자 침대에서 조용히 방전된다",
      },
    ],
    SN: [
      {
        axis: "SN",
        prompt: "새 과목을 팔 때 네 방식은?",
        optFirst: "교재·기출을 순서대로 꼼꼼히 외운다",
        optSecond: "큰 그림·원리부터 잡고 가지를 뻗어 이해한다",
      },
      {
        axis: "SN",
        prompt: "필기 정리, 네 노트는?",
        optFirst: "교재·말을 순서대로 촘촘히 옮긴다",
        optSecond: "핵심만 내 식으로 그림·화살표로 잇는다",
      },
    ],
    TF: [
      {
        axis: "TF",
        prompt: "모의고사를 망쳤다. 먼저 드는 반응은?",
        optFirst: "어디서 틀렸는지 분석하고 전략을 고친다",
        optSecond: "아 속상해… 일단 마음 추스를 위로가 필요하다",
      },
      {
        axis: "TF",
        prompt: "친구가 성적 때문에 우울해해. 너는?",
        optFirst: "같이 원인 짚고 계획 다시 짜준다",
        optSecond: "옆에서 마음부터 다독여준다",
      },
    ],
    JP: [
      {
        axis: "JP",
        prompt: "시험공부, 네 페이스는?",
        optFirst: "D-30 플래너 짜서 진도를 관리한다",
        optSecond: "발등에 불 떨어지면 그때 폭발적으로 몰아친다",
      },
      {
        axis: "JP",
        prompt: "시험 2주 전 갑자기 범위가 늘었어. 너는?",
        optFirst: "계획표를 다시 촘촘히 갈아엎는다",
        optSecond: "우선순위만 잡고 그때그때 유연하게 민다",
      },
    ],
  },
};

/** 등록된 모든 테마. */
export const THEMES: readonly Theme[] = [BASE_THEME, LOVE_THEME, EXAM_THEME];

/** themeId 로 테마 조회. */
export function getTheme(themeId: string): Theme | undefined {
  return THEMES.find((t) => t.themeId === themeId);
}

/**
 * 축당 1개씩 뽑아 4문항 세트를 구성. 항상 AXES 순서(EI,SN,TF,JP)로 반환.
 * pick(axis, poolLen) 은 0..poolLen-1 인덱스를 돌려주는 콜백(랜덤 주입).
 * 범위를 벗어난 값은 클램프한다.
 */
export function buildQuestionSet(
  theme: Theme,
  pick: (axis: Axis, poolLen: number) => number,
): ThemeQuestion[] {
  return AXES.map((axis) => {
    const arr = theme.pool[axis];
    const raw = pick(axis, arr.length);
    const i = Number.isInteger(raw) ? Math.min(Math.max(raw, 0), arr.length - 1) : 0;
    return arr[i];
  });
}
