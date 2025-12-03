import Team from "@/components/sections/team";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <main className="relative flex flex-col items-center justify-center py-24 px-6 md:px-20">
      <Team />
    </main>
  );
}

