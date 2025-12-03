"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Github, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { resolveCdnUrl } from "@/lib/constants";

const AGNES_IMAGE_SRC = resolveCdnUrl("/uploads/agnes.jpg");

type TeamMemberKey = "agnes";

type TeamMember = {
  key: TeamMemberKey;
  image: string;
  socials: {
    twitter?: string;
    github?: string;
    website?: string;
  };
};

const team: TeamMember[] = [
  {
    key: "agnes",
    image: AGNES_IMAGE_SRC,
    socials: {
      twitter: "https://x.com/agnes0912491",
      github: "https://github.com/agnes0912491",
      website: "https://agnes0912491.github.io/",
    },
  },
];

export default function Team() {
  const t = useTranslations("Team");

  return (
    <section id="team" className="relative flex flex-col items-center justify-center py-32 px-4 text-center">
      <h2 className="section-title mb-20 neon-text">{t("title")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto relative z-10">
        {team.map(({ key, image, socials }, index) => {
          const name = t(`members.${key}.name` as const);
          const role = t(`members.${key}.role` as const);
          const description = t(`members.${key}.description` as const);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="glass relative overflow-hidden rounded-xl border border-[rgba(0,167,197,0.15)] hover:border-[rgba(0,167,197,0.4)] transition-all duration-500"
            >
              <div className="relative w-full h-56 overflow-hidden">
                <Image crossOrigin="anonymous" src={image} alt={name} fill className="object-cover opacity-80 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              </div>

              <div className="p-6 text-left">
                <h3 className="text-xl font-display text-[color:var(--color-turkish-blue-400)] mb-1">{name}</h3>
                <p className="text-[rgba(255,255,255,0.6)] text-sm mb-2">{role}</p>
                <p className="text-xs text-[rgba(255,255,255,0.5)] leading-relaxed">{description}</p>
              </div>

              <div className="absolute top-4 right-4 flex flex-col gap-3">
                {socials.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-colors bg-[var(--background)] px-2 py-1 rounded-md text-xs font-medium"
                  >
                    <X className="inline w-5 h-5 mr-1" />
                  </a>
                )}
                {socials.github && (
                  <a
                    href={socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-colors bg-[var(--background)] px-2 py-1 rounded-md text-xs font-medium"
                  >
                    <Github className="inline w-5 h-5 mr-1" />
                  </a>
                )}
                {socials.website && (
                  <a
                    href={socials.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-colors bg-[var(--background)] px-2 py-1 rounded-md text-xs font-medium"
                  >
                    {t("website")}
                  </a>
                )}
              </div>

              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-all duration-700 shadow-[0_0_25px_rgba(0,167,197,0.4)]" />
            </motion.div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,167,197,0.05)_0%,transparent_70%)] blur-3xl pointer-events-none" />
    </section>
  );
}
