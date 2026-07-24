"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/** 결과 카드 PNG 저장 — /api/og 이미지를 받아 다운로드. 기본 3:4 세로 카드. */
export function PngSaveButton({ fmt = "card", label = "이미지 저장" }: { fmt?: string; label?: string }) {
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      const d = new URLSearchParams(window.location.search).get("d") ?? "";
      const res = await fetch(`/api/og?d=${encodeURIComponent(d)}&fmt=${fmt}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `타입컷-${fmt}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      track("share_click", { channel: `png_${fmt}` });
    } catch {
      /* 저장 실패는 조용히 무시 */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={save}
      disabled={busy}
      className="border-ink w-full rounded-xl border-2 bg-white py-3.5 text-base font-bold text-ink shadow-popsm transition active:translate-y-[1px] disabled:opacity-60"
    >
      {busy ? "저장 중…" : `🖼️ ${label}`}
    </button>
  );
}
