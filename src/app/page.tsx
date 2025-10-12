import Hero from "./_sections/hero";
import Goals from "./_sections/goals";
import Projects from "./_sections/projects";
import Network from "./_sections/network";
import Team from "./_sections/team";
 


export default function HomePage() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen">
      <Hero />
      <Goals />
      <Projects />
      <Team />
      <Network />
    </main>
  );
}
