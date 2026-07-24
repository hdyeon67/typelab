# 타입컷 (typelab)

가장 빠른 유형 테스트 — 테마를 고르고 **4문항(약 30초)**만 답하면 나를 닮은 동물 캐릭터 유형(16종)과 4글자 성향 코드가 나온다. `typecut.fineboll.com`.

> ⚠️ 법적: 코드·UI·문구·메타 어디에도 특정 성격유형 검사의 등록상표명을 쓰지 않는다(그 이름 자체를 리포지토리 어디에도 남기지 않음). "성향 코드"·"유형"으로만 표기. 모든 문항·해설은 자체 창작. 푸터·about 에 "재미로 보는 성향 테스트이며 심리검사가 아니에요" 고지.

## 스택
Next.js 14+ (App Router) · TypeScript · Tailwind · Cloudflare Workers(OpenNext). DB 없음, 실시간 AI 호출 없음(운영비 0원). 결과 공유는 `?d=` base64url(개인정보 미저장).

## 구조
- `lib/typelab-engine/` — 결정적 엔진(4문항 채점·코드 확정·변형 시드·테마 카탈로그) + 단위 테스트.
- `lib/content/` — 16유형 본체(type-detail)·테마 코멘트·결과 조립(select)·가이드.
- `lib/config/` — site·flags(env 게이트)·promos(크로스 프로모션).
- `lib/theme/colors.ts` — 4기질(NT/NF/SJ/SP) 가족색.
- `app/` — 랜딩(`/`)·응시(`/quiz`)·결과(`/result`)·가이드·about·privacy·OG(`/api/og`).

## 개발
```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest (엔진·콘텐츠)
npx tsc --noEmit # 타입 체크
```

## 배포 (Cloudflare Workers)
```bash
npm run cf:build && npm run cf:deploy
```
⚠️ `cf:deploy` 는 재빌드하지 않는다 → **반드시 `cf:build && cf:deploy` 순서**.
⚠️ `.env.production` 의 `NEXT_PUBLIC_SITE_URL` 은 빌드 전 필수(OG URL 이 빌드타임 인라인).
⚠️ CI(Cloudflare Build git연동) 사용 시 광고·카카오·PostHog 키를 **Cloudflare Build 환경변수**에도 등록해야 재빌드 시 유지된다(ADFIT·PostHog 공통 함정).

## env 플래그 (없으면 자동 비활성)
`.env.local.example` 참고. 결제(`PAYMENT_ENABLED`)·광고(애드핏 3유닛·애드센스)·카카오(`NEXT_PUBLIC_KAKAO_JS_KEY`)·계측(`NEXT_PUBLIC_POSTHOG_KEY`) 전부 env 온오프. 현재 전부 잠금(false/빈값).

## 캐릭터 에셋 (16종, 폴백 우선)
`public/types/{code}.png` (예: `enfp.png`, 정사각 1024, 크림 배경+잉크 외곽선). 없으면 (기질 가족색 칩 + 동물 이모지 + 캐릭터명) 폴백으로 정상 동작 → 에셋이 늦어도 출시 비차단.

## 광고 정책 (회사 표준 2026-07-18)
AdRails(PC 세로)+AdBottomMobile(모바일 하단)을 루트 레이아웃에. 랜딩·결과·가이드·about·privacy 전부 노출, **응시(`/quiz`)만 제외**(완주율 보호).

## 크로스 프로모션 상호 등록 (배포 후 할 일)
`lib/config/promos.ts` 에서 맥락 매칭(연애→케미체크, 시험→행운부적) + 퀴즈 클러스터(문해력·신조어) 최대 2슬롯. **다른 앱들의 promos 에도 타입컷을 추가**할 것:
- 케미체크·행운부적: 연애/시험 결 앱으로 타입컷 배너 추가 고려.
- 문해력·신조어: 퀴즈 클러스터에 타입컷 추가 고려.

## 계측 이벤트 (app="typelab")
`landing_view`·`theme_start(theme)`·`quiz_complete(theme)`·`result_view(type_code)`·`share_click(channel)`·`cta_friend_click`·`theme_switch`·`cross_banner_click`. 핵심 지표: 랜딩→theme_start 전환율, quiz_complete 완주율.
