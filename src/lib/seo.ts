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

/**
 * FAQ Schema - for FAQ pages or sections
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function getFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

/**
 * LocalBusiness Schema - for local SEO in Istanbul
 */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${BASE_URL}/#organization`,
    name: "Tengra Studio",
    alternateName: "Tengra",
    url: BASE_URL,
    logo: `${CDN_URL}/uploads/tengra_without_text.png`,
    image: `${CDN_URL}/uploads/tengra_without_text.png`,
    description: "Creative tech studio building web and mobile applications with cutting-edge technology.",
    telephone: "+90-XXX-XXX-XXXX", // Add real number when available
    email: "hello@tengra.studio",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Istanbul",
      addressRegion: "Istanbul",
      addressCountry: "TR"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.0082,
      longitude: 28.9784
    },
    areaServed: [
      { "@type": "Country", name: "Turkey" },
      { "@type": "Country", name: "Worldwide" }
    ],
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00"
    },
    sameAs: [
      "https://twitter.com/tengrastudio",
      "https://github.com/tengrastudio",
      "https://instagram.com/tengrastudio",
      "https://linkedin.com/company/tengrastudio"
    ]
  };
}

/**
 * Service Schema - for service pages
 */
export function getServiceSchema(service: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url.startsWith("http") ? service.url : `${BASE_URL}${service.url}`,
    provider: {
      "@type": "Organization",
      name: "Tengra Studio",
      url: BASE_URL
    },
    areaServed: {
      "@type": "Country",
      name: "Worldwide"
    }
  };
}
