/**
 * SEO Utilities for Tengra and related apps
 */

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tengra.studio";
export const CDN_URL = "https://cdn.tengra.studio";

/**
 * Organization Schema for Tengra Studio
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tengra Studio",
    url: BASE_URL,
    logo: `${CDN_URL}/uploads/tengra_without_text.png`,
    description: "Digital product studio building the next generation of web and mobile applications.",
    sameAs: [
      "https://twitter.com/tengrastudio",
      "https://github.com/tengrastudio",
      "https://instagram.com/tengrastudio",
      "https://linkedin.com/company/tengrastudio"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@tengra.studio",
      contactType: "customer service",
      availableLanguage: ["en", "tr"]
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR"
    }
  };
}

/**
 * WebSite Schema
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tengra Studio",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * BreadcrumbList Schema
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

/**
 * Generic SEO Generator
 */
export interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  author?: string;
  type?: "article" | "website";
  url?: string;
  createdAt?: string;
}

export function generateSEO({ title, description, image, author, type = "article", url, createdAt }: SEOProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebPage",
    headline: title,
    description: description,
    image: image ? (image.startsWith("http") ? image : `${CDN_URL}/${image}`) : undefined,
    author: author ? {
      "@type": "Person",
      name: author
    } : {
      "@type": "Organization",
      name: "Tengra Studio"
    },
    publisher: {
      "@type": "Organization",
      name: "Tengra Studio",
      logo: {
        "@type": "ImageObject",
        url: `${CDN_URL}/uploads/tengra_without_text.png`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url || BASE_URL
    }
  };

  if (createdAt) {
    schema.datePublished = createdAt;
    schema.dateModified = createdAt; // Should ideally be updatedAt
  }

  return schema;
}
