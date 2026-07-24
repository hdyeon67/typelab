"use client";

import { usePathname } from "next/navigation";
import { AdFit } from "./AdFit";
import { ADFIT_UNIT_PC_LEFT, ADFIT_UNIT_PC_RIGHT, ADFIT_UNIT_MOBILE } from "@/lib/config/flags";

// 회사 광고 정책(2026-07-18 확정): 시작(랜딩)부터 결과까지 전 화면에 광고를 붙인다.
// 예외는 응시("/quiz") — 완주율 보호. 랜딩·결과·가이드·about·privacy 모두 노출.

/** 광고 제외 경로 (응시 화면만) */
function adExcluded(pathname: string): boolean {
  return pathname === "/quiz";
}

/**
 * PC 좌·우 세로 사이드 광고(160×600). xl(1280px) 이상에서만 노출.
 * 응시 화면 제외 전 페이지. 단위 ID(env)가 없으면 렌더하지 않는다.
 */
export function AdRails() {
  const pathname = usePathname();
  if (adExcluded(pathname)) return null;
  if (!ADFIT_UNIT_PC_LEFT && !ADFIT_UNIT_PC_RIGHT) return null;
  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 left-0 z-30 hidden items-center pl-3 xl:flex">
        <div className="pointer-events-auto">
          <AdFit unit={ADFIT_UNIT_PC_LEFT} width={160} height={600} />
        </div>
      </div>
      <div className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden items-center pr-3 xl:flex">
        <div className="pointer-events-auto">
          <AdFit unit={ADFIT_UNIT_PC_RIGHT} width={160} height={600} />
        </div>
      </div>
    </>
  );
}

/** 모바일 하단 가로 배너(320×100). xl 미만에서만. 응시 화면 제외 전 페이지. */
export function AdBottomMobile({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  if (adExcluded(pathname)) return null;
  if (!ADFIT_UNIT_MOBILE) return null;
  return (
    <div className={`xl:hidden ${className}`}>
      <AdFit unit={ADFIT_UNIT_MOBILE} width={320} height={100} />
    </div>
  );
}
