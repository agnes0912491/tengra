import HomePage from "@/components/home/home-page";
import SiteShell from "@/components/layout/site-shell";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Tengra Studio  Shaping myth, code, and divine precision",
  description:
    "Immersive digital craftsmanship fusing the sacred with technology. We build high-performance web and mobile applications with next-generation design.",
  path: "/",
});

export default function IndexPage() {
  return (
    <SiteShell fullWidth>
      <HomePage />
    </SiteShell>
  );
}
