"use client";

import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";
import { Delete, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
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

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatStatus = (status?: Project["status"]) => {
  switch (status) {
    case "draft":
      return "Taslak";
    case "in_progress":
      return "Geliştiriliyor";
    case "on_hold":
      return "Beklemede";
    case "completed":
      return "Tamamlandı";
    case "archived":
      return "Arşivlendi";
    default:
      return "Belirsiz";
  }
};

type Props = {
  projects: Project[];
};

export default function ProjectsTable({ projects }: Props) {
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [descriptionsByLocale, setDescriptionsByLocale] = useState<Record<string, string>>({});

  const locales = routing.locales;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (typeof window === "undefined") return;
        const fromStorage = localStorage.getItem("authToken");
        if (fromStorage) {
          setToken(fromStorage);
          return;
        }
        // Fallback to admin cookies (aligned with other admin tools)
        const { ADMIN_SESSION_COOKIE_CANDIDATES } = await import("@/lib/auth");
        const { default: Cookies } = await import("js-cookie");
        const fromCookies =
          ADMIN_SESSION_COOKIE_CANDIDATES.map((name) => Cookies.get(name)).find(Boolean) ||
          null;
        if (fromCookies) {
          setToken(fromCookies);
        }
      } catch (error) {
        console.error("Failed to read authToken from localStorage:", error);
      }
    };
    fetchToken();
  }, []);

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.55)]">
        Henüz proje verisi alınamadı. Lütfen daha sonra tekrar deneyin.
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
      toast.error("Yetkilendirme belirteci eksik. Lütfen tekrar giriş yapın.");
      return;
    }
    await ep(options, projectId, token);
    toast.success("Proje başarıyla güncellendi.");
  };

  const deleteProject = async (projectId: string) => {
    if (!token) {
      toast.error("Yetkilendirme belirteci eksik. Lütfen tekrar giriş yapın.");
      return;
    }

    await dp(projectId, token);
    toast.success("Proje başarıyla silindi.");
  };

  return (
    <>
      <Dialog open={editProjectModalOpen} onOpenChange={() => setEditProjectModalOpen(false)}>
        <DialogContent className="max-w-2xl border border-[rgba(110,211,225,0.25)] bg-[rgba(6,18,26,0.9)] shadow-[0_22px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Projeyi Düzenle</DialogTitle>
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
                <label className="text-sm text-[rgba(255,255,255,0.8)]">Proje Adı</label>
                <Input name="name" defaultValue={project?.name || ""} required className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white" />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">
                  Açıklama (çok dilli)
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
                  Logo / Görsel
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
                      toast.error(
                        "Görsel yüklemek için önce yeniden giriş yapın."
                      );
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
                        toast.error("Görsel yüklenemedi.");
                      }
                    } catch (err) {
                      console.error("Logo upload failed", err);
                      toast.error("Görsel yüklenirken bir hata oluştu.");
                    } finally {
                      setLogoUploading(false);
                    }
                  }}
                >
                  {logoPreview || project?.logoUrl ? (
                    <span className="text-xs text-[rgba(255,255,255,0.8)]">
                      Yeni görsel seçmek için tıklayın veya sürükleyip bırakın.
                    </span>
                  ) : (
                    <span className="text-xs text-[rgba(255,255,255,0.6)]">
                      PNG/JPG/WebP sürükleyip bırakın veya tıklayın
                    </span>
                  )}
                </Dropzone>
                {(logoPreview || project?.logoUrl) && (
                  <div className="mt-2 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(4,18,24,0.85)] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview || project?.logoUrl || ""}
                      alt="logo"
                      className="h-12 w-12 rounded object-contain"
                    />
                    <p className="mt-1 text-[11px] text-[rgba(255,255,255,0.65)]">
                      Mevcut logo önizlemesi
                    </p>
                  </div>
                )}
                {logoUploading && (
                  <p className="text-xs text-[rgba(255,255,255,0.7)]">
                    Görsel yükleniyor…
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">Durum</label>
                <select name="status" defaultValue={project?.status || "draft"} className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-2 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none">
                  <option value="draft">Taslak</option>
                  <option value="in_progress">Geliştiriliyor</option>
                  <option value="on_hold">Beklemede</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="archived">Arşivlendi</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">Tür</label>
                <select name="type" defaultValue={project?.type || "other"} className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-2 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none">
                  <option value="game">Oyun</option>
                  <option value="website">Web Sitesi</option>
                  <option value="tool">Araç</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Değişiklikleri Kaydet
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteProjectModalOpen} onOpenChange={() => setDeleteProjectModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projeyi Sil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[rgba(255,255,255,0.8)]">
              Bu işlemi gerçekleştirmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteProjectModalOpen(false)} className="border-[rgba(0,167,197,0.3)]">
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!project) return;
                  const projectId = project.id;
                  deleteProject(projectId as string);
                  setDeleteProjectModalOpen(false);
                }}
                className="bg-[color:var(--color-red-600)] text-white hover:bg-[color:var(--color-red-500)]"
              >
                Projeyi Sil
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
                Proje
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
                Tür
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
                Durum
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
                Son Güncelleme
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.8)]">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-[rgba(8,32,42,0.55)]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {project.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.logoUrl} alt="logo" className="h-8 w-8 rounded object-contain" />
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
                    {project.type || "other"}
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
                  <Button onClick={() => openEditModal(project)} variant="link" size="sm" className="ml-auto px-4 py-2">
                    <Edit className="mr-2 h-4 w-4" />
                  </Button>
                </td>
                <td>
                  <Button onClick={() => openDeleteModal(project)} variant="link" size="sm" className="ml-auto px-4 py-2">
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
