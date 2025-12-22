"use client";

import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";
import { Delete, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useTransition } from "react";
import { editProject as ep, deleteProject as dp, uploadImage } from "@/lib/db";
import { toast } from "@/lib/react-toastify";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import Dropzone from "@/components/ui/dropzone";
import { routing } from "@/i18n/routing";
import { useAdminToken } from "@/hooks/use-admin-token";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  projects: Project[];
};

export default function ProjectsTable({ projects }: Props) {
  const t = useTranslations("AdminProjects");
  const locale = useLocale();
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [descriptionsByLocale, setDescriptionsByLocale] = useState<Record<string, string>>({});
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [isPending, startTransition] = useTransition();

  const locales = routing.locales;
  const { token } = useAdminToken();
  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };
  const formatStatus = (status?: Project["status"]) => {
    switch (status) {
      case "draft":
        return t("status.draft");
      case "in_progress":
        return t("status.inProgress");
      case "on_hold":
        return t("status.onHold");
      case "completed":
        return t("status.completed");
      case "archived":
        return t("status.archived");
      default:
        return t("status.unknown");
    }
  };
  const formatType = (type?: Project["type"]) => {
    switch (type) {
      case "game":
        return t("types.game");
      case "website":
        return t("types.website");
      case "tool":
        return t("types.tool");
      case "app":
        return t("types.app");
      case "library":
        return t("types.library");
      case "other":
        return t("types.other");
      default:
        return t("types.other");
    }
  };

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.55)]">
        {t("empty")}
      </div>
    );
  }

  const openEditModal = (project: Project) => {
    setEditProjectModalOpen(true);
    setProject(project);
    setLogoPreview(project.logoUrl ?? null);
    // Parse existing description JSON if present
    const current: Record<string, string> = {};
    if (project.description) {
      try {
        const parsed = JSON.parse(project.description) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const rec = parsed as Record<string, unknown>;
          for (const loc of locales) {
            const value = rec[loc];
            if (typeof value === "string") {
              current[loc] = value;
            }
          }
        } else {
          current[locales[0]] = project.description;
        }
      } catch {
        current[locales[0]] = project.description;
      }
    }
    setDescriptionsByLocale(current);
  };
  const openDeleteModal = (project: Project) => {
    setDeleteProjectModalOpen(true);
    setProject(project);
  };

  const editProject = async (
    options: {
      name?: string;
      description?: string;
      status?: Project["status"];
      type?: Project["type"];
      logoUrl?: string | null;
    },
    projectId: string
  ) => {
    if (!token) {
      toast.error(t("toast.missingToken"));
      return;
    }
    startTransition(async () => {
      const updated = await ep(options, projectId, token);
      if (!updated) {
        toast.error(t("toast.updateFailed"));
        return;
      }
      setLocalProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p)));
      toast.success(t("toast.updateSuccess"));
    });
  };

  const deleteProject = async (projectId: string) => {
    if (!token) {
      toast.error(t("toast.missingToken"));
      return;
    }

    startTransition(async () => {
      await dp(projectId, token);
      setLocalProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success(t("toast.deleteSuccess"));
    });
  };

  return (
    <>
      <Dialog open={editProjectModalOpen} onOpenChange={() => setEditProjectModalOpen(false)}>
        <DialogContent className="max-w-2xl border border-[rgba(110,211,225,0.25)] bg-[rgba(6,18,26,0.9)] shadow-[0_22px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>{t("dialogs.edit.title")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!project) return;

              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const name = formData.get("name") as string;
              const status = formData.get("status") as Project["status"];
              const type = formData.get("type") as Project["type"];
              const logoUrlRaw = (formData.get("logoUrl") as string) || "";
              const logoUrl = logoUrlRaw.trim() || undefined;

              const cleanedDescriptions: Record<string, string> = {};
              locales.forEach((loc) => {
                const value = descriptionsByLocale[loc];
                if (typeof value === "string" && value.trim().length > 0) {
                  cleanedDescriptions[loc] = value;
                }
              });
              const description =
                Object.keys(cleanedDescriptions).length > 0
                  ? JSON.stringify(cleanedDescriptions)
                  : "";

              editProject(
                { name, description, status, type, logoUrl },
                project.id as string
              );
              setEditProjectModalOpen(false);
            }}
          >
            <input type="hidden" name="projectId" value="" />
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("fields.name")}</label>
                <Input name="name" defaultValue={project?.name || ""} required className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white" />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">
                  {t("fields.descriptionMultilang")}
                </label>
                {locales.map((loc) => (
                  <div key={loc} className="space-y-1">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-[rgba(255,255,255,0.65)]">
                      {loc.toUpperCase()}
                    </span>
                    <textarea
                      value={descriptionsByLocale[loc] || ""}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setDescriptionsByLocale((prev) => ({
                          ...prev,
                          [loc]: value,
                        }));
                      }}
                      className="min-h-[80px] w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-3 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none text-sm"
                      rows={4}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">
                  {t("fields.logo")}
                </label>
                <input
                  type="hidden"
                  name="logoUrl"
                  value={logoPreview ?? project?.logoUrl ?? ""}
                />
                <Dropzone
                  accept={{
                    "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
                  }}
                  onDrop={async (files) => {
                    const file = files[0];
                    if (!file) return;
                    if (!token) {
                      toast.error(t("toast.uploadAuthRequired"));
                      return;
                    }
                    setLogoUploading(true);
                    try {
                      const toDataUrl = (f: File) =>
                        new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () =>
                            resolve(String(reader.result || ""));
                          reader.readAsDataURL(f);
                        });
                      const dataUrl = await toDataUrl(file);
                      const uploaded = await uploadImage(dataUrl, token);
                      if (uploaded?.url) {
                        setLogoPreview(uploaded.url);
                      } else if (uploaded?.dataUrl) {
                        setLogoPreview(uploaded.dataUrl);
                      } else {
                        toast.error(t("toast.imageUploadFailed"));
                      }
                    } catch (err) {
                      console.error("Logo upload failed", err);
                      toast.error(t("toast.imageUploadError"));
                    } finally {
                      setLogoUploading(false);
                    }
                  }}
                >
                  {logoPreview || project?.logoUrl ? (
                    <span className="text-xs text-[rgba(255,255,255,0.8)]">
                      {t("fields.logoReplaceHint")}
                    </span>
                  ) : (
                    <span className="text-xs text-[rgba(255,255,255,0.6)]">
                      {t("fields.logoHint")}
                    </span>
                  )}
                </Dropzone>
                {(logoPreview || project?.logoUrl) && (
                  <div className="mt-2 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(4,18,24,0.85)] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview || project?.logoUrl || ""}
                      alt={t("fields.logoPreview")}
                      className="h-12 w-12 rounded object-contain"
                    />
                    <p className="mt-1 text-[11px] text-[rgba(255,255,255,0.65)]">
                      {t("fields.logoCurrent")}
                    </p>
                  </div>
                )}
                {logoUploading && (
                  <p className="text-xs text-[rgba(255,255,255,0.7)]">
                    {t("fields.logoUploading")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("fields.status")}</label>
                <select name="status" defaultValue={project?.status || "draft"} className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-2 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none">
                  <option value="draft">{t("status.draft")}</option>
                  <option value="in_progress">{t("status.inProgress")}</option>
                  <option value="on_hold">{t("status.onHold")}</option>
                  <option value="completed">{t("status.completed")}</option>
                  <option value="archived">{t("status.archived")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("fields.type")}</label>
                <select name="type" defaultValue={project?.type || "other"} className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-2 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none">
                  <option value="game">{t("types.game")}</option>
                  <option value="website">{t("types.website")}</option>
                  <option value="tool">{t("types.tool")}</option>
                  <option value="other">{t("types.other")}</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                {t("actions.saveChanges")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteProjectModalOpen} onOpenChange={() => setDeleteProjectModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.delete.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[rgba(255,255,255,0.8)]">
              {t("dialogs.delete.description")}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteProjectModalOpen(false)} className="border-[rgba(0,167,197,0.3)]">
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => {
                  if (!project) return;
                  const projectId = project.id;
                  deleteProject(projectId as string);
                  setDeleteProjectModalOpen(false);
                }}
                className="bg-[color:var(--color-red-600)] text-white hover:bg-[color:var(--color-red-500)]"
              >
                {t("actions.delete")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="overflow-hidden rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.55)]/80 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <table className="min-w-full divide-y divide-[rgba(110,211,225,0.15)]">
          <thead className="bg-[rgba(8,24,32,0.9)] text-[rgba(255,255,255,0.75)]">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
                {t("table.project")}
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
                {t("table.type")}
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
                {t("table.status")}
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
                {t("table.lastUpdated")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.8)]">
            {localProjects.map((project) => (
              <tr key={project.id} className="hover:bg-[rgba(8,32,42,0.55)]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {project.logoUrl ? (
                      <div className="relative h-8 w-8 rounded overflow-hidden">
                        <Image
                          src={project.logoUrl}
                          alt={t("fields.logoPreview")}
                          fill
                          className="object-contain"
                          sizes="32px"
                          unoptimized={!project.logoUrl.startsWith('https://cdn.tengra.studio')}
                        />
                      </div>
                    ) : null}
                    <p className="font-semibold text-white">{project.name}</p>
                  </div>
                  {project.description ? (
                    <p className="mt-1 text-xs text-[rgba(255,255,255,0.55)]">
                      {project.description}
                    </p>
                  ) : null}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full border border-[rgba(110,211,225,0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-200)]">
                    {formatType(project.type)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full border border-[rgba(110,211,225,0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-200)]">
                    {formatStatus(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-[rgba(255,255,255,0.65)]">
                  {formatDateTime(project.lastUpdatedAt ?? project.createdAt ?? undefined)}
                </td>
                <td>
                  <Button onClick={() => openEditModal(project)} variant="link" size="sm" className="ml-auto px-4 py-2" disabled={isPending}>
                    <Edit className="mr-2 h-4 w-4" />
                  </Button>
                </td>
                <td>
                  <Button onClick={() => openDeleteModal(project)} variant="link" size="sm" className="ml-auto px-4 py-2" disabled={isPending}>
                    <Delete className="mr-2 h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
