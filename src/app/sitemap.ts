import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tengra.studio";
  
  // Ana sayfalar
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Blog yazılarını ekle (ISR ile statik)
  try {
    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_BASE}/blogs`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = (await res.json().catch(() => ({}))) as { posts?: Array<{ id?: string | number; createdAt?: string; updatedAt?: string }> };
      const posts = Array.isArray(json?.posts) ? json.posts : [];
      const blogRoutes = posts.map((p) => ({
        url: `${baseUrl}/blogs/${String(p.id ?? "")}`,
        lastModified: new Date(p.updatedAt || p.createdAt || new Date().toISOString()),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })).filter((r) => r.url.endsWith("/") === false && r.url.length > `${baseUrl}/blogs/`.length);
      routes.push(...blogRoutes);
    }
  } catch (error) {
    console.error("Failed to fetch blogs for sitemap:", error);
  }

  return routes;
}
