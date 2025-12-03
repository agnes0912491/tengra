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
  onCtaClick?: () => void; // allow pages to override CTA behaviour
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

    // Implement project save logic here - map fields from the provided Project
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
      <div className="flex flex-col gap-4 rounded-3xl border border-[rgba(110,211,225,0.18)] bg-[rgba(6,20,27,0.7)]/80 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-display tracking-[0.2em] text-[color:var(--color-turkish-blue-300)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-sm md:text-base text-[color:var(--text-muted)] leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {actions}
          {ctaLabel ? (
            <button
              type="button"
              onClick={handleClick}
              className={cn(
                "btn btn-primary btn-ripple",
                "px-6 py-3 text-[11px] tracking-[0.22em] uppercase"
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
