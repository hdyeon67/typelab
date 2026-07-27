"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { PngSaveButton } from "./PngSaveButton";
import { KakaoShareButton } from "./KakaoShareButton";

/** 결과 공유·CTA 액션 — 이미지 저장(3:4)/카카오(env)/링크 복사/친구 유형 CTA. */
export function ResultActions({
  shareTitle,
  shareDesc,
  ogImage,
}: {
  shareTitle: string;
  shareDesc: string;
  /** 공유 미리보기 이미지 절대 URL(정적 카드 우선). 카카오로 전달. */
  ogImage: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    track("share_click", { channel: "copy_result" });
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 클립보드 차단 환경 — 무시 */
    }
  }

  return (
    <div className="mt-6 space-y-2.5">
      {/* 이미지 저장 — 3:4 세로 카드 단일 버튼 */}
      <PngSaveButton fmt="card" label="이미지 저장" />

      {/* 카카오 공유 (JS 키 있을 때만 노출) */}
      <KakaoShareButton title={shareTitle} description={shareDesc} imageUrl={ogImage} />

      <div className="flex gap-2.5">
        <button
          onClick={copyLink}
          className="border-ink/15 hover:border-pop text-ink flex-1 rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold transition"
        >
          {copied ? "복사됨 ✅" : "결과 링크 복사 🔗"}
        </button>
        <button
          onClick={() => {
            track("cta_friend_click", {});
            router.push("/");
          }}
          className="border-ink/15 hover:border-pop text-ink flex-1 rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold transition"
        >
          친구는 무슨 유형? 🙋
        </button>
      </div>
    </div>
  );
}
