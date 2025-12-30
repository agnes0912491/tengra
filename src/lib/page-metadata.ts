import type { Metadata } from "next";
import { BASE_URL } from "@/lib/seo";

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex,
}: PageMetadataOptions): Metadata {
  const url = path ? new URL(path, BASE_URL).toString() : BASE_URL;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Tengra Studio",
      type: "website",
    },
  };

  if (path) {
    metadata.alternates = { canonical: url };
  }

  if (noIndex) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}
