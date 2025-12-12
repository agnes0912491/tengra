"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ExternalLink, Settings } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { getAllProjects } from "@/lib/db";
import type { Project } from "@/types/project";
import { resolveCdnUrl, getLocalizedText } from "@/lib/constants";

const FALLBACK_IMAGE = resolveCdnUrl("/uploads/tengra_without_text.png");

export default function Projects() {
  const t = useTranslations("Projects");
  const { user, isAuthenticated } = useAuth();
  const isAdmin = useMemo(() => user?.role === "admin", [user]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

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

  const buildProjectUrl = (name?: string | null, id?: number | string | null) => {
    if (!name && !id) return "#";
    const sub = name
      ? name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      : `project-${id}`;

    // Ensure we use the subdomain
    return `https://${sub}.tengra.studio`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "draft":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const renderMeta = (project: Project) => {
    const type = project.type ?? "other";
    const status = project.status ?? "draft";
    return (
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-300)] border border-[rgba(72,213,255,0.2)]">
          {type}
        </span>
        <span className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    );
  };

  return (
    <section
      id="projects"
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(72,213,255,0.06)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
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
            Explore our portfolio of innovative projects and experiences.
          </p>
        </motion.div>

        {/* Admin Tools */}
        {isAuthenticated && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-6 rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] backdrop-blur-xl"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[rgba(30,184,255,0.1)]">
                <Settings className="w-6 h-6 text-[var(--color-turkish-blue-400)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {t("admin.toolsTitle")}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {t("admin.toolsDescription")}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/admin"
                    prefetch={false}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-300)] border border-[rgba(72,213,255,0.2)] hover:bg-[rgba(30,184,255,0.15)] hover:border-[rgba(72,213,255,0.3)] transition-all"
                  >
                    {t("admin.backToAdmin")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-dashed border-[rgba(72,213,255,0.3)] text-[var(--color-turkish-blue-400)] hover:bg-[rgba(30,184,255,0.05)] transition-all"
                    title={t("admin.placeholderAction")}
                  >
                    {t("admin.newProject")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--color-turkish-blue-500)] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400">Failed to load projects.</p>
          </div>
        )}

        {/* Projects Grid/Slider */}
        {!loading && !error && (
          <div
            className={
              isSlider
                ? "relative"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            }
          >
            {isSlider ? (
              <div className="group/slider relative">
                <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {projects.map((proj, index) => {
                    const title = proj.name;
                    const description =
                      getLocalizedText(proj.description ?? "", locale) ?? "";
                    const image = resolveCdnUrl(proj.logoUrl || FALLBACK_IMAGE);

                    return (
                      <a
                        key={proj.id ?? `${title}-${index}`}
                        href={buildProjectUrl(proj.name, proj.id)}
                        className="group relative flex-shrink-0 w-[320px] snap-center"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          viewport={{ once: true }}
                          className="h-full rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] backdrop-blur-xl overflow-hidden hover:border-[rgba(72,213,255,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_rgba(30,184,255,0.1)] transition-all duration-300"
                        >
                          {/* Image */}
                          <div className="relative h-[160px] overflow-hidden">
                            <Image
                              crossOrigin="anonymous"
                              src={image}
                              alt={title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,31,54,1)] via-[rgba(15,31,54,0.5)] to-transparent" />
                            {/* Hover Icon */}
                            <div className="absolute top-4 right-4 p-2 rounded-lg bg-[rgba(15,31,54,0.8)] border border-[rgba(72,213,255,0.2)] opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-turkish-blue-300)] transition-colors line-clamp-1">
                              {title}
                            </h3>
                            <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">
                              {description}
                            </p>
                            {renderMeta(proj)}
                          </div>
                        </motion.div>
                      </a>
                    );
                  })}
                </div>

                {/* Gradient Fades */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--color-surface-900)] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--color-surface-900)] to-transparent" />

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between px-2">
                  <span className="text-sm text-[var(--text-muted)]">{projects.length} projects</span>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-turkish-blue-400)]">
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ) : (
              projects.map((proj, index) => {
                const title = proj.name;
                const description =
                  getLocalizedText(proj.description ?? "", locale) ?? "";
                const image = resolveCdnUrl(proj.logoUrl || FALLBACK_IMAGE);

                return (
                  <a
                    key={proj.id ?? `${title}-${index}`}
                    href={buildProjectUrl(proj.name, proj.id)}
                    className="group"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="h-full rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] backdrop-blur-xl overflow-hidden hover:border-[rgba(72,213,255,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_rgba(30,184,255,0.1)] hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          crossOrigin="anonymous"
                          src={image}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,31,54,1)] via-[rgba(15,31,54,0.3)] to-transparent" />
                        {/* Hover Icon */}
                        <div className="absolute top-4 right-4 p-2 rounded-lg bg-[rgba(15,31,54,0.8)] border border-[rgba(72,213,255,0.2)] opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-turkish-blue-300)] transition-colors">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">
                          {description}
                        </p>
                        {renderMeta(proj)}
                      </div>
                    </motion.div>
                  </a>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
