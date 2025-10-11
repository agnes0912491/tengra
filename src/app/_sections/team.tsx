"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Agnes from "../../../public/agnes.jpg";
import { Github, X } from "lucide-react";

const team = [
  {
    name: "A. Agnes Ö.",
    role: "Founder / Vision Architect",
    desc: "Shaping the balance between divinity and technology.",
    img: Agnes.src,
    socials: {
      twitter: "https://x.com/agnes0912491",
      github: "https://github.com/agnes0912491",
      website: "https://agnes0912491.github.io/",
    },
  },
];

export default function Team() {
  return (
    <section
      id="team"
      className="relative flex flex-col items-center justify-center py-32 px-4 text-center"
    >
      <h2 className="section-title mb-20 neon-text">Team</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto relative z-10">
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            className="glass relative overflow-hidden rounded-xl border border-[rgba(0,167,197,0.15)] hover:border-[rgba(0,167,197,0.4)] transition-all duration-500"
          >
            {/* Görsel */}
            <div className="relative w-full h-56 overflow-hidden">
              <Image
                src={member.img}
                alt={member.name}
                fill
                className="object-cover opacity-80 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
            </div>

            {/* Bilgi */}
            <div className="p-6 text-left">
              <h3 className="text-xl font-display text-[color:var(--color-turkish-blue-400)] mb-1">
                {member.name}
              </h3>
              <p className="text-[rgba(255,255,255,0.6)] text-sm mb-2">
                {member.role}
              </p>
              <p className="text-xs text-[rgba(255,255,255,0.5)] leading-relaxed">
                {member.desc}
              </p>
            </div>

            {/* Sosyal Medya Bağlantıları */}
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              {member.socials.twitter && (
                <a
                  href={member.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-colors bg-[var(--background)] px-2 py-1 rounded-md text-xs font-medium"
                >
                  <X className="inline w-5 h-5 mr-1" />
                </a>
              )}
              {member.socials.github && (
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-colors bg-[var(--background)] px-2 py-1 rounded-md text-xs font-medium"
                >
                  <Github className="inline w-5 h-5 mr-1" />
                </a>
              )}
              {member.socials.website && (
                <a
                  href={member.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-colors bg-[var(--background)] px-2 py-1 rounded-md text-xs font-medium"
                >
                  Website
                </a>
              )}
            </div>

            {/* Parlayan kenar */}
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-all duration-700 shadow-[0_0_25px_rgba(0,167,197,0.4)]" />
          </motion.div>
        ))}
      </div>

      {/* Aura background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,167,197,0.05)_0%,transparent_70%)] blur-3xl pointer-events-none" />
    </section>
  );
}
