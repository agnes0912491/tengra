"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/providers/auth-provider";
import { getAllProjects } from "@/lib/db";
import type { Project } from "@/types/project";

const FALLBACK_IMAGE = "/tengra_without_text.png";

export default function Projects() {
  const t = useTranslations("Projects");
  const { user, isAuthenticated } = useAuth();
  const isAdmin = useMemo(() => user?.role === "admin", [user]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const list = await getAllProjects();
        if (!cancel) setProjects(list);
      } catch (e) {
        if (!cancel) setError(String(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const isSlider = projects.length > 5;

  return (
    <section
      id="projects"
      className="relative flex flex-col items-center justify-center py-32 px-4 text-center"
    >
      <h2 className="section-title neon-text">{t("title")}</h2>

      <div className="w-16 h-[1px] mx-auto mt-3 mb-10 bg-[rgba(0,167,197,0.4)]" />

      {/*
        Admin tools are only visible to authenticated users with role=admin.
        This is a UI affordance. Server-side authorization is still required
        when performing privileged operations.
      */}
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
              prefetch={false}
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

      {loading && (
        <div className="mt-8 text-sm text-[rgba(255,255,255,0.7)]">Projeler yükleniyor…</div>
      )}
      {error && (
        <div className="mt-8 text-sm text-red-400">Projeler alınamadı.</div>
      )}
      <div
        className={
          isSlider
            ? "relative w-full max-w-6xl overflow-hidden"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto"
        }
      >
        {/* Slider container */}
        {isSlider ? (
          <div className="group/slider relative">
            <div
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {projects.map((proj, index) => {
                const title = proj.name;
                const description = proj.description ?? "";
                const image = proj.logoUrl || FALLBACK_IMAGE;

                return (
                  <motion.div
                    key={proj.id ?? `${title}-${index}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.45 }}
                    viewport={{ once: true }}
                    className="glass relative h-[260px] w-[320px] shrink-0 snap-center overflow-hidden rounded-xl border border-[rgba(0,167,197,0.15)] transition-all duration-500 hover:border-[rgba(0,167,197,0.5)]"
                  >
                    <div className="relative h-[150px] w-full overflow-hidden">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover opacity-80 transition-all duration-700 group-hover/slider:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                    </div>
                    <div className="p-4 text-left">
                      <h3 className="mb-1 line-clamp-1 text-lg font-display text-[color:var(--color-turkish-blue-400)]">
                        {title}
                      </h3>
                      <p className="line-clamp-3 text-[12px] text-[rgba(255,255,255,0.7)]">{description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          projects.map((proj, index) => {
            const title = proj.name;
            const description = proj.description ?? "";
            const image = proj.logoUrl || FALLBACK_IMAGE;

            return (
              <motion.div
                key={proj.id ?? `${title}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-xl glass border border-[rgba(0,167,197,0.15)] transition-all duration-500 hover:border-[rgba(0,167,197,0.5)]"
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
          })
        )}
      </div>
    </section>
  );
}
