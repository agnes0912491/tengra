import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://tengra.studio", lastModified: new Date() },
    { url: "https://tengra.studio/projects", lastModified: new Date() },
    { url: "https://tengra.studio/blogs", lastModified: new Date() },
    { url: "https://tengra.studio/community", lastModified: new Date() },
  ];
}
