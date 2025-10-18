import Goals from "@/components/sections/goals";
import Hero from "@/components/sections/hero";
import Network from "@/components/sections/network";
import Projects from "@/components/sections/projects";
import Team from "@/components/sections/team";
import FAQ from "@/components/sections/faq";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen">
      <Hero />
      <Goals />
      <Projects />
      {/* <Team /> */}
      <FAQ />
      <Network />
    </main>
  );
}
