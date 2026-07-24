import { ThemePicker } from "@/components/landing/ThemePicker";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-[85vh] max-w-md flex-col items-center justify-center px-5 py-10">
      <div className="mb-7 text-center">
        <p className="text-pop-deep text-sm font-bold tracking-wide">가장 빠른 유형 테스트</p>
        <h1 className="text-ink mt-2 text-4xl font-black leading-tight">타입컷</h1>
        <p className="text-ink-soft mt-3 text-[15px] leading-relaxed">
          검사 30분? 여긴 <b className="text-pop-deep">4문항 30초</b>.
          <br />
          나를 닮은 동물 캐릭터 유형이 바로 나와요.
        </p>
      </div>

      <ThemePicker />

      <ul className="text-ink-faint mt-7 space-y-1 text-center text-xs leading-relaxed">
        <li>· 테마 고르고 4문항만 · 이름·생일 입력 없음</li>
        <li>· 동물 캐릭터 카드 + 성향 코드 + 케미 유형</li>
        <li>· 결과 카드로 친구랑 유형 비교</li>
      </ul>

      <p className="text-ink-faint/80 mt-6 text-center text-[11px]">
        재미로 보는 성향 테스트예요 · 심리검사가 아니에요
      </p>
    </main>
  );
}
