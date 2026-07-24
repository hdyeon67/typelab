import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 결과·응시 페이지는 개인 응답 기반이라 색인 제외
      disallow: ["/result", "/quiz"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
