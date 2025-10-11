"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const projects = [
  {
    title: "Inception",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonum.",
    image: "/images/project1.jpg",
  },
  {
    title: "Expansion",
    desc: "Ut pharetra justo ac diam placerat, in faucibus nisl feugiat.",
    image: "/images/project2.jpg",
  },
  {
    title: "Oposatb",
    desc: "Integer sed lorem nec arcu tristique elementum aliquam sed eros.",
    image: "/images/project3.jpg",
  },
];

export default function Projects() {
  return (
    <section
      id="projects"
      className="relative flex flex-col items-center justify-center py-32 px-4 text-center"
    >
      <h2 className="section-title neon-text">Projects</h2>

      <div className="w-16 h-[1px] mx-auto mt-3 mb-10 bg-[rgba(0,167,197,0.4)]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {projects.map((proj, i) => (
          <motion.div
            key={proj.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-xl overflow-hidden group glass border border-[rgba(0,167,197,0.15)] hover:border-[rgba(0,167,197,0.5)] transition-all duration-500"
          >
            {/* Görsel */}
            <div className="relative w-full h-56 overflow-hidden">
              <Image
                src={proj.image}
                alt={proj.title}
                fill
                className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 group-hover:to-black/30 transition-all" />
            </div>

            {/* İçerik */}
            <div className="p-6 text-left">
              <h3 className="text-xl font-display text-[color:var(--color-turkish-blue-400)] mb-2 group-hover:text-[color:var(--color-turkish-blue-300)] transition-colors">
                {proj.title}
              </h3>
              <p className="text-xs text-[rgba(255,255,255,0.6)]">
                {proj.desc}
              </p>
            </div>

            {/* Neon border efekti */}
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 shadow-[0_0_20px_rgba(0,167,197,0.6)]" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
