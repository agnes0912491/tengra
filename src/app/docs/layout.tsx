import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "API Docs | Tengra Studio",
  description: "API documentation for Tengra and Lova services.",
  path: "/docs",
});

export default function DocsLayout({ children }: { children: ReactNode }) {
  return children;
}
