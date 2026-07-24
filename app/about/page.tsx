import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "소개",
  description: `${SITE.name} 소개 — 4문항 30초로 보는 가장 빠른 유형 테스트.`,
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <h1 className="text-ink text-2xl font-black">타입컷 소개</h1>

      <div className="text-ink-soft mt-5 space-y-4 text-[15px] leading-relaxed">
        <p>
          타입컷은 테마를 고르고 4문항(약 30초)만 답하면 나를 닮은 동물 캐릭터 유형이 바로 나오는
          <b className="text-ink"> 가장 빠른 유형 테스트</b>예요. 긴 검사가 부담스러울 때, 친구와
          가볍게 “너는 무슨 유형?” 하고 떠들기 좋은 스몰토크용으로 만들었어요.
        </p>
        <p>
          성향을 가르는 네 가지 축(에너지·인식·결정·리듬)을 문항 하나씩으로 물어, 네 번의 선택이
          곧 4글자 성향 코드가 돼요. 같은 답이면 언제나 같은 결과가 나오는 방식이라, 결과 링크를
          공유하면 친구도 똑같이 확인할 수 있어요.
        </p>
        <p>
          연애 상황으로 묻는 테마, 시험기간 버전 테마처럼 같은 성향을 다른 상황으로 물어보는
          시리즈도 있어요. 기분 따라 골라 즐겨 보세요.
        </p>
        <p className="text-ink-faint text-sm">
          ※ 타입컷은 <b>재미로 보는 성향 테스트이며 심리검사가 아니에요.</b> 결과는 사람을 규정하지
          않고, 성향 코드는 재미용 유형일 뿐이에요. 어떤 유형이 더 낫고 못하고는 없어요.
        </p>
        <p className="text-ink-faint text-sm">
          개인정보(이름·생년월일)를 입력받거나 저장하지 않아요. 결과는 서버가 아니라 링크 안에만
          담깁니다. 자세한 내용은{" "}
          <Link href="/privacy" className="text-pop-deep underline underline-offset-2">
            개인정보처리방침
          </Link>
          을 참고해 주세요.
        </p>
      </div>

      <Link
        href="/"
        className="bg-pop hover:bg-pop-deep shadow-popsm mt-8 block w-full rounded-xl py-4 text-center text-lg font-bold text-white transition"
      >
        내 유형 확인하러 가기 →
      </Link>
    </main>
  );
}
