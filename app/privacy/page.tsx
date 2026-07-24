import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE.name} 개인정보처리방침 — 개인정보를 저장하지 않아요.`,
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <h1 className="text-ink text-2xl font-black">개인정보처리방침</h1>

      <div className="text-ink-soft mt-5 space-y-5 text-[14px] leading-relaxed">
        <section>
          <h2 className="text-ink mb-1.5 text-base font-bold">1. 수집하지 않는 정보</h2>
          <p>
            타입컷은 이름·생년월일·연락처 등 개인정보를 입력받지 않으며 서버에 저장하지 않아요.
            테스트는 테마 선택과 4문항 응답만으로 진행돼요.
          </p>
        </section>
        <section>
          <h2 className="text-ink mb-1.5 text-base font-bold">2. 결과의 저장 방식</h2>
          <p>
            결과는 데이터베이스에 저장되지 않고, 응답을 인코딩한 값이 결과 페이지 링크(?d=) 안에만
            담겨요. 링크를 공유하지 않으면 결과가 외부에 남지 않아요.
          </p>
        </section>
        <section>
          <h2 className="text-ink mb-1.5 text-base font-bold">3. 통계 분석</h2>
          <p>
            서비스 개선을 위해 익명 통계 도구(PostHog·Cloudflare)를 사용할 수 있어요. 이때 쿠키 없이
            방문·이벤트를 집계하며, 개인을 식별할 수 있는 정보나 응답 원본은 전송하지 않아요.
          </p>
        </section>
        <section>
          <h2 className="text-ink mb-1.5 text-base font-bold">4. 광고</h2>
          <p>
            운영을 위해 제3자 광고(카카오 애드핏·구글 애드센스)가 노출될 수 있어요. 광고 사업자는
            자체 정책에 따라 쿠키 등을 사용할 수 있으며, 이는 각 사업자의 정책을 따라요.
          </p>
        </section>
        <section>
          <h2 className="text-ink mb-1.5 text-base font-bold">5. 문의</h2>
          <p>개인정보 관련 문의는 EDEN APPWORKS(fineboll)로 연락해 주세요.</p>
        </section>
        <p className="text-ink-faint text-xs">
          타입컷은 재미·참고용 콘텐츠이며 심리검사가 아니에요.
        </p>
      </div>
    </main>
  );
}
