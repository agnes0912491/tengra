import { Metadata } from "next";
import Team from "@/components/sections/team";
import SiteShell from "@/components/layout/site-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Team | Tengra Studio",
  description: "Meet the talented team behind Tengra Studio. Developers, designers, and creators building the future of digital experiences from Istanbul.",
  keywords: ["tengra team", "yazılım ekibi", "İstanbul developer team"],
  openGraph: {
    title: "Tengra Studio Team",
    description: "Meet the minds behind Tengra Studio's innovative digital products.",
    url: "https://tengra.studio/team",
  },
};

export default function TeamPage() {
  return (
    <SiteShell>
      <div className="px-4 py-16 md:px-10">
        <Team />
      </div>
    </SiteShell>
  );
}
