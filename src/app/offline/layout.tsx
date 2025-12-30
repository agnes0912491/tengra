import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Offline | Tengra Studio",
  description: "Offline mode for Tengra Studio.",
  path: "/offline",
  noIndex: true,
});

export default function OfflineLayout({ children }: { children: ReactNode }) {
  return children;
}
