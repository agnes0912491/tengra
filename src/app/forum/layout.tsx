import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Community Forum | Tengra Studio",
  description: "Community discussions, updates, and support.",
  path: "/forum",
});

export default function ForumLayout({ children }: { children: ReactNode }) {
  return children;
}
