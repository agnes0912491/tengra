import type { Metadata } from "next";

interface SEOConfig {
  title: string;
  description?: string;
  image?: string;
  author?: string;
  type?: "website" | "article" | "profile";
  url?: string;
  keywords?: string[];
  createdAt?: string;
}

const SITE_NAME = "TENGRA";
const BASE_URL = "https://tengra.studio";

export function generateSEO({
  title,
  description = "Forging the Divine and the Technological. TENGRA unites art, science, and technology into one vision.",
  image = `${BASE_URL}/og-image.png`,
  author = "TENGRA Studio",
  type = "website",
  url = BASE_URL,
  keywords = ["TENGRA", "Game Studio", "Futuristic Design", "Tengri", "Software", "AI", "Encryption", "Games"],
  createdAt,
}: SEOConfig): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return {
    title: fullTitle,
    description,
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630 }],
      locale: "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      site: "@tengra",
      title: fullTitle,
      description,
      images: [image],
    },
    authors: [{ name: author }],
    other: {
      ...(createdAt && { "article:published_time": createdAt }),
      "article:author": author,
    },
  };
}
