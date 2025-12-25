"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Github, Twitter, Globe } from "lucide-react";
import { useTranslation } from "@tengra/language";
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
  const { t } = useTranslation("Team");

  return (
    <section id="team" className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.08)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">{t("title")}</h2>
          <div className="divider mt-6 mb-6" />
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t("description")}
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {team.map(({ key, image, socials }, index) => {
            const name = t(`members.${key}.name` as const);
            const role = t(`members.${key}.role` as const);
            const description = t(`members.${key}.description` as const);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] backdrop-blur-xl overflow-hidden hover:border-[rgba(72,213,255,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_rgba(30,184,255,0.1)] hover:-translate-y-1 transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      crossOrigin="anonymous"
                      src={image}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,31,54,1)] via-[rgba(15,31,54,0.3)] to-transparent" />

                    {/* Social Links Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {socials.twitter && (
                        <a
                          href={socials.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[rgba(15,31,54,0.9)] border border-[rgba(72,213,255,0.2)] text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] hover:border-[rgba(72,213,255,0.4)] transition-all"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {socials.github && (
                        <a
                          href={socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[rgba(15,31,54,0.9)] border border-[rgba(72,213,255,0.2)] text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] hover:border-[rgba(72,213,255,0.4)] transition-all"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {socials.website && (
                        <a
                          href={socials.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[rgba(15,31,54,0.9)] border border-[rgba(72,213,255,0.2)] text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] hover:border-[rgba(72,213,255,0.4)] transition-all"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-turkish-blue-300)] transition-colors">
                      {name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[var(--color-turkish-blue-400)]">
                      {role}
                    </p>
                    <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
