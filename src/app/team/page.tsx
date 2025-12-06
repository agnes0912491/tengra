import Team from "@/components/sections/team";
import SiteShell from "@/components/layout/site-shell";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <SiteShell>
      <div className="px-4 py-16 md:px-10">
        <Team />
      </div>
    </SiteShell>
  );
}
