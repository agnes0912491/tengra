import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import TechStack from "@/components/sections/tech-stack";
import Process from "@/components/sections/process";
import Projects from "@/components/sections/projects";
import Stats from "@/components/sections/stats";
import Testimonials from "@/components/home/testimonials"; // Using new version
import ContactSection from "@/components/sections/contact-section";
import GithubGraph from "@/components/home/github-graph";


export default function HomePage() {
  return (
    <main className="flex flex-col w-full min-h-screen overflow-x-hidden">
      <Hero /> 

      <TechStack />
      <Features />
      <Process />
      <Projects />
      <Testimonials />
      <Stats />
      <ContactSection />
    </main>
  );
}

