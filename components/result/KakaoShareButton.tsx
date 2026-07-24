"use client";

import { useEffect, useState } from "react";
import { KAKAO_ENABLED, KAKAO_JS_KEY } from "@/lib/config/flags";
import { track } from "@/lib/analytics";

// 카카오톡 공유 — JS 키가 있을 때만 노출(현재 미발급이라 렌더되지 않음).
// 키 발급 후 NEXT_PUBLIC_KAKAO_JS_KEY 설정하면 자동 활성화.

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: { sendDefault: (o: unknown) => void };
    };
  }
}

const SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

export function KakaoShareButton({ title, description }: { title: string; description: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!KAKAO_ENABLED) return;
    if (window.Kakao?.isInitialized()) {
      setReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_SRC}"]`);
    const onload = () => {
      try {
        if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
        setReady(true);
      } catch {
        setReady(false);
      }
    };
    if (existing) {
      onload();
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_SRC;
    s.async = true;
    s.onload = onload;
    document.head.appendChild(s);
  }, []);

  if (!KAKAO_ENABLED) return null;

  function share() {
    if (!ready || !window.Kakao) return;
    track("share_click", { channel: "kakao" });
    const url = window.location.href;
    const d = new URLSearchParams(window.location.search).get("d") ?? "";
    const image = `${window.location.origin}/api/og?d=${encodeURIComponent(d)}`;
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: image,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        { title: "결과 보기", link: { mobileWebUrl: url, webUrl: url } },
        {
          title: "나도 해보기",
          link: { mobileWebUrl: window.location.origin, webUrl: window.location.origin },
        },
      ],
    });
  }

  return (
    <button
      type="button"
      onClick={share}
      disabled={!ready}
      className="border-ink w-full rounded-xl border-2 bg-[#FEE500] py-3.5 text-base font-extrabold text-[#3c1e1e] shadow-popsm transition active:translate-y-[1px] disabled:opacity-50"
    >
      💬 카카오톡으로 공유
    </button>
  );
}
