import { MetadataRoute } from "next";
import { getAllBlogs } from "@/lib/db";

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

  // Blog yazılarını ekle
  try {
    const blogs = await getAllBlogs();
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.id}`,
      lastModified: new Date(blog.updatedAt || blog.date),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
    routes.push(...blogRoutes);
  } catch (error) {
    console.error("Failed to fetch blogs for sitemap:", error);
  }

  return routes;
}