import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Footer } from "@/components/footer";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { AdRails, AdBottomMobile } from "@/components/AdRails";
import { SITE, siteUrl } from "@/lib/config/site";
import { ADS_ENABLED, ADSENSE_CLIENT } from "@/lib/config/flags";

const SITE_URL = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "타입컷 · 4문항 30초 유형 테스트",
    template: "%s · 타입컷",
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "타입컷 · 4문항 30초 유형 테스트",
    description: "4문항 30초, 나를 닮은 동물 캐릭터 유형이 바로 나오는 가장 빠른 유형 테스트.",
    // 홈/기본 공유용 브랜드 카드. 결과 페이지는 자체 og:image 로 덮어씀.
    images: ["/api/og?fmt=home"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AnalyticsProvider />
        <AdRails />
        {ADS_ENABLED && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        )}
        {children}
        {/* 모바일 하단 배너 — 응시("/quiz") 제외 전 페이지(랜딩 포함). 단위 ID 있을 때만 노출 */}
        <AdBottomMobile className="mx-auto flex max-w-md justify-center px-5 pb-4" />
        <Footer
          logoSrc={null}
          links={[
            { label: "가이드", href: "/guide/성향-테스트" },
            { label: "소개", href: "/about" },
            { label: "개인정보처리방침", href: "/privacy" },
          ]}
          note="재미로 보는 성향 테스트이며 심리검사가 아니에요 · 개인정보를 저장하지 않아요"
        />
      </body>
    </html>
  );
}
