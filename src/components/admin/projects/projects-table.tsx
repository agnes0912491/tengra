"use client";

import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";
import { Delete, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { editProject as ep, deleteProject as dp } from "@/lib/db";
import { toast } from "@/lib/react-toastify";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

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

  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (localStorage.getItem("authToken")) {
          setToken(localStorage.getItem("authToken"));
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
  };
  const openDeleteModal = (project: Project) => {
    setDeleteProjectModalOpen(true);
    setProject(project);
  };

  const editProject = async (
    options: { name?: string; description?: string; status?: Project["status"]; type?: Project["type"] },
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
        <DialogContent>
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
              const description = formData.get("description") as string;
              const status = formData.get("status") as Project["status"];
              const type = formData.get("type") as Project["type"];

              editProject({ name, description, status, type }, project.id as string);
              setEditProjectModalOpen(false);
            }}
          >
            <input type="hidden" name="projectId" value="" />
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">Proje Adı</label>
                <Input name="name" defaultValue={project?.name || ""} required className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[rgba(255,255,255,0.8)]">Açıklama</label>
                <textarea name="description" defaultValue={project?.description || ""} rows={5} className="min-h-[120px] w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-3 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none" />
              </div>
              {/** Logo URL alanı kaldırıldı */}
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
          <thead className="bg-[rgba(8,24,32,0.8)] text-[rgba(255,255,255,0.65)]">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
                Proje
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
                Tür
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
                Durum
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
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
