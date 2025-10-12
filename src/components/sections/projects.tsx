"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/providers/auth-provider";

type ProjectKey = "inception" | "expansion" | "oposatb";

type ProjectDefinition = {
  key: ProjectKey;
  image: string;
};

// The original project images are not present in `public/images/` on the server
// which caused Next's image optimizer to fail during SSR. Use a safe fallback
// image that exists in `public/` so the homepage can render.
const projects: ProjectDefinition[] = [
  { key: "inception", image: "/tengra_without_text.png" },
  { key: "expansion", image: "/tengra_without_text.png" },
  { key: "oposatb", image: "/tengra_without_text.png" },
];

export default function Projects() {
  const t = useTranslations("Projects");
  const { user, isAuthenticated } = useAuth();
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  return (
    <section
      id="projects"
      className="relative flex flex-col items-center justify-center py-32 px-4 text-center"
    >
      <h2 className="section-title neon-text">{t("title")}</h2>

      <div className="w-16 h-[1px] mx-auto mt-3 mb-10 bg-[rgba(0,167,197,0.4)]" />

      {isAuthenticated && isAdmin && (
        <div className="mb-12 w-full max-w-5xl rounded-xl border border-[rgba(0,167,197,0.2)] bg-[rgba(0,167,197,0.06)] p-6 text-left">
          <h3 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">
            {t("admin.toolsTitle")}
          </h3>
          <p className="mt-2 text-xs text-gray-300">
            {t("admin.toolsDescription")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/admin"
              className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.12)]"
            >
              {t("admin.backToAdmin")}
            </Link>
            <button
              type="button"
              className="rounded-full border border-dashed border-[rgba(0,167,197,0.4)] px-4 py-1 text-[color:var(--color-turkish-blue-200)] opacity-80"
              title={t("admin.placeholderAction")}
            >
              {t("admin.newProject")}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {projects.map(({ key, image }, index) => {
          const title = t(`items.${key}.title` as const);
          const description = t(`items.${key}.description` as const);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="relative rounded-xl overflow-hidden group glass border border-[rgba(0,167,197,0.15)] hover:border-[rgba(0,167,197,0.5)] transition-all duration-500"
            >
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 group-hover:to-black/30 transition-all" />
              </div>

              <div className="p-6 text-left">
                <h3 className="text-xl font-display text-[color:var(--color-turkish-blue-400)] mb-2 group-hover:text-[color:var(--color-turkish-blue-300)] transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-[rgba(255,255,255,0.6)]">
                  {description}
                </p>
              </div>

              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 shadow-[0_0_20px_rgba(0,167,197,0.6)]" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
