import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tengra.studio";
  const now = new Date();

  // Ana sayfalar ve statik bölümler
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
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

  // Projeleri ekle (ISR ile statik)
  try {
    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_BASE}/projects`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = (await res.json().catch(() => [])) as Array<{
        id?: string | number;
        slug?: string | null;
        updatedAt?: string;
        createdAt?: string;
      }>;
      if (Array.isArray(json)) {
        const projectRoutes = json
          .map((p) => {
            const slugOrId = p.slug || p.id;
            if (!slugOrId) return null;
            return {
              url: `${baseUrl}/projects/${String(slugOrId)}`,
              lastModified: new Date(p.updatedAt || p.createdAt || now.toISOString()),
              changeFrequency: "monthly" as const,
              priority: 0.6,
            };
          })
          .filter((r): r is NonNullable<typeof r> => Boolean(r));
        routes.push(...projectRoutes);
      }
    }
  } catch (error) {
    console.error("Failed to fetch projects for sitemap:", error);
  }

  return routes;
}
