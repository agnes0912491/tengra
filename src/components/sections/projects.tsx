"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import GlowCard from "@/components/ui/glow-card";
import GradientText from "@/components/ui/gradient-text";
import { getAllProjects } from "@/lib/db";
import type { Project } from "@/types/project";
import { resolveCdnUrl, getLocalizedText } from "@/lib/constants";
import { useAuth } from "@/components/providers/auth-provider";
import { useTranslation } from "@tengra/language";

const FALLBACK_IMAGE = resolveCdnUrl("/uploads/tengra_without_text.png");

const Projects = () => {
  const { t } = useTranslation("Projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { language: locale } = useTranslation();

  useEffect(() => {
    getAllProjects()
      .then(setProjects)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
    return `https://${sub}.tengra.studio`;
  };

  const formatStatus = (status?: string | null) => {
    switch (status) {
      case "draft":
        return t("status.draft");
      case "active":
        return t("status.active");
      case "in_progress":
        return t("status.inProgress");
      case "on_hold":
        return t("status.onHold");
      case "completed":
        return t("status.completed");
      case "published":
        return t("status.published");
      case "archived":
        return t("status.archived");
      default:
        return t("status.unknown");
    }
  };

  const formatType = (type?: string | null) => {
    switch (type) {
      case "game":
        return t("types.game");
      case "website":
        return t("types.website");
      case "tool":
        return t("types.tool");
      case "app":
        return t("types.app");
      case "mobile":
        return t("types.mobile");
      case "library":
        return t("types.library");
      case "other":
        return t("types.other");
      default:
        return t("types.unknown");
    }
  };

  const getStatusClassName = (status?: string | null) => {
    if (status === "completed") {
      return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    }
    if (status === "active" || status === "in_progress" || status === "published") {
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    }
    if (status === "on_hold") {
      return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
    return "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";
  };

  return (
    <section id="projects" className="relative py-24 px-4 bg-[var(--color-background)] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              <GradientText>{t("title")}</GradientText>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[rgba(255,255,255,0.6)]"
            >
              {t("description")}
            </motion.p>
          </div>

          {isAdmin && (
            <Link href="/admin/dashboard/projects" className="px-4 py-2 text-sm font-medium rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors">
              {t("admin.manage")}
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-[rgba(255,255,255,0.05)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((proj, index) => {
                const imageUrl = resolveCdnUrl(proj.logoUrl || FALLBACK_IMAGE);
                const projectUrl = buildProjectUrl(proj.name, proj.id);
                const statusKey = String(proj.status || "draft");
                const statusLabel = formatStatus(statusKey);
                const typeLabel = formatType(proj.type);

                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlowCard className="h-full group cursor-pointer" glowColor="rgba(110, 211, 225, 0.3)">
                      <Link href={projectUrl} target="_blank" className="flex flex-col h-full">
                        {/* Image Container */}
                        <div className="relative h-64 w-full overflow-hidden border-b border-[rgba(255,255,255,0.05)]">
                          <Image
                            crossOrigin="anonymous"
                            src={imageUrl}
                            alt={proj.name ? t("imageAlt", { name: proj.name }) : t("imageAltFallback")}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,20,27,0.8)] to-transparent opacity-60" />

                          {/* Overlay Icon */}
                          <div className="absolute top-4 right-4 p-2 rounded-full bg-black/50 border border-white/10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-sm text-white">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 mb-3">
                            {proj.type && (
                              <span className="px-2 py-1 rounded-md bg-[rgba(110,211,225,0.1)] border border-[rgba(110,211,225,0.2)] text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-turkish-blue-400)]">
                                {typeLabel}
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusClassName(statusKey)}`}>
                              {statusLabel}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[color:var(--color-turkish-blue-400)] transition-colors">
                            {proj.name}
                          </h3>

                          <p className="text-sm text-[rgba(255,255,255,0.5)] line-clamp-3 mb-6 flex-1">
                            {getLocalizedText(proj.descriptionsByLocale || proj.description, locale) || t("fallbackDescription")}
                          </p>

                          <div className="flex items-center text-sm font-medium text-white group/link">
                            {t("viewProject")}
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    </GlowCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
