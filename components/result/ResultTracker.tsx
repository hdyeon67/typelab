"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** 결과 조회 계측 — 유형 코드만 전송(비식별). */
export function ResultTracker({ typeCode }: { typeCode: string }) {
  useEffect(() => {
    track("result_view", { type_code: typeCode });
  }, [typeCode]);
  return null;
}
