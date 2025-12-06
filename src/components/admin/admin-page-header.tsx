"use client";

import { ReactNode, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectEditModal from "./projects/project-edit-modal";
import { cn } from "@/lib/utils";
import { createProject } from "@/lib/db";
import { Project } from "@/types/project";

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  actions?: ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  actions,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const handleClick = useCallback(() => {
    if (!ctaLabel) {
      return;
    }

    if (typeof onCtaClick === "function") {
      onCtaClick();
      return;
    }

    if (ctaHref) {
      router.push(ctaHref);
      return;
    }

    setIsOpen(true);
  }, [ctaHref, ctaLabel, router, onCtaClick]);

  const handleSave = (project: Project) => {
    if (!token) {
      console.error("No auth token found");
      return;
    }

    createProject({
      name: project.name,
      description: project.description,
      status: project.status,
      type: project.type,
      logoUrl: project.logoUrl,
    } as Project, token)
      .then(() => {
        setIsOpen(false);
        router.refresh();
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          console.error("Failed to create project", err);
        } else {
          console.error("Failed to create project", String(err));
        }
      });
  }

  return (
    <>
      <ProjectEditModal open={isOpen} onClose={() => setIsOpen(false)} onSave={handleSave} />
      <div className="relative flex flex-col gap-4 rounded-2xl border border-[rgba(72,213,255,0.12)] bg-[rgba(15,31,54,0.6)] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_20px_rgba(30,184,255,0.05)] backdrop-blur-xl overflow-hidden md:flex-row md:items-center md:justify-between">
        {/* Background glow */}
        <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.1)_0%,transparent_70%)] blur-2xl" />

        <div className="relative max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wider text-[var(--text-primary)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center">
          {actions}
          {ctaLabel ? (
            <button
              type="button"
              onClick={handleClick}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3",
                "text-sm font-medium tracking-wide",
                "bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)]",
                "text-white shadow-[0_4px_20px_rgba(30,184,255,0.25)]",
                "hover:from-[var(--color-turkish-blue-400)] hover:to-[var(--color-turkish-blue-500)]",
                "hover:shadow-[0_6px_25px_rgba(30,184,255,0.35)]",
                "transition-all duration-200"
              )}
            >
              {ctaLabel}
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
