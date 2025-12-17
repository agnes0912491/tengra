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

      {/* Social Proof & Activity Section - NEW */}
      <section className="container mx-auto px-4 py-12 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Coding Activity</h2>
              <p className="text-[rgba(255,255,255,0.6)]">Building in public. Consistent contributions to open source and private projects.</p>
              <GithubGraph />
            </div>
          </div>
        </div>
      </section>

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

