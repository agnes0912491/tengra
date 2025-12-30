import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Projects | Tengra Studio",
  description: "Selected projects built by Tengra Studio.",
  path: "/projects",
});

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children;
}
