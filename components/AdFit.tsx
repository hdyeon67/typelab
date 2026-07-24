"use client";

import { useEffect, useRef } from "react";

/**
 * 카카오 애드핏 광고 단위 (회사 표준 — munhae/shinjo와 동일 방식).
 * - <ins class="kakao_ad_area"> 를 만들고 ba.min.js 를 붙여 채운다.
 * - unit(광고단위 ID)이 없으면 아무것도 렌더하지 않는다(빈 슬롯 방지).
 * - localhost 등 미등록 도메인에선 광고가 안 나온다(정상). 실제 노출은 배포 도메인.
 */
export function AdFit({
  unit,
  width,
  height,
  className = "",
}: {
  unit?: string;
  width: number;
  height: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || !unit) return;
    container.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", String(width));
    ins.setAttribute("data-ad-height", String(height));

    const script = document.createElement("script");
    script.async = true;
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";

    container.appendChild(ins);
    container.appendChild(script);
  }, [unit, width, height]);

  if (!unit) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <div ref={ref} style={{ width, height, maxWidth: "100%" }} />
    </div>
  );
}
