import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Careers | Tengra Studio",
  description: "Explore roles and team culture at Tengra Studio.",
  path: "/careers",
});

export default function CareersLayout({ children }: { children: ReactNode }) {
  return children;
}
