import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "타입컷",
    short_name: "타입컷",
    start_url: "/",
    display: "standalone",
    // 아이덴티티 색(= app/icon.svg 배경). ⚠️background_color 는 **스플래시 배경**이라
    // 앱 배경(크림)과 달라 진입 시 색이 한 번 튄다 — 8개 앱 공통 사안이라 보류(2026-07-28).
    background_color: BRAND.dark,
    theme_color: BRAND.dark,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
