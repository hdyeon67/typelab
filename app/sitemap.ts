import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";
import { GUIDE_SLUGS } from "@/lib/content/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const staticRoutes = ["", "/about", "/privacy", "/guide"];
  const guideRoutes = GUIDE_SLUGS.map((s) => `/guide/${encodeURIComponent(s)}`);

  return [...staticRoutes, ...guideRoutes].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path.startsWith("/guide") ? "monthly" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
