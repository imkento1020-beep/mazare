import type { MetadataRoute } from "next";
import { fetchShopsFromDb } from "@/lib/home/shops";
import { getSiteUrl } from "@/lib/site/url";

export const revalidate = 3600;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/home", changeFrequency: "hourly", priority: 0.9 },
  { path: "/search", changeFrequency: "daily", priority: 0.8 },
  { path: "/map", changeFrequency: "daily", priority: 0.8 },
  { path: "/tonight", changeFrequency: "hourly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${baseUrl}${path || "/"}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const { data: shops } = await fetchShopsFromDb();

  const shopEntries: MetadataRoute.Sitemap = (shops ?? []).map((shop) => ({
    url: `${baseUrl}/shop/${shop.id}`,
    lastModified: shop.created_at ? new Date(shop.created_at) : now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...shopEntries];
}
