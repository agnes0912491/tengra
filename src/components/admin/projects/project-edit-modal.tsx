// src/components/admin/projects/project-edit-modal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Project, ProjectType } from "@/types/project";
import Dropzone from "@/components/ui/dropzone";
import { uploadImage } from "@/lib/db";
import Image from "next/image";

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (project: Project) => void;
};

export default function ProjectEditModal({ open, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<Partial<Project>>(
        {
            name: "",
            description: "",
            status: "draft",
            type: "other",
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name) {
            onSave(formData as Project);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.95)] backdrop-blur-2xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-300)]">
                        Yeni Proje
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">Proje Adı</label>
                        <Input
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                            className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">Açıklama</label>
                        <textarea
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                            className="min-h-[120px] w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-3 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none"
                            rows={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">Logo/Görsel (sürükle-bırak)</label>
                        <Dropzone
                            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] }}
                            onDrop={async (files) => {
                                const file = files[0];
                                if (!file) return;
                                const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
                                const toDataUrl = (f: File) =>
                                  new Promise<string>((resolve) => {
                                    const reader = new FileReader();
                                    reader.onload = () => resolve(String(reader.result || ""));
                                    reader.readAsDataURL(f);
                                  });
                                const dataUrl = await toDataUrl(file);
                                try {
                                  if (token) {
                                    const uploaded = await uploadImage(dataUrl, token);
                                    if (uploaded?.url) {
                                      setFormData({ ...formData, logoUrl: uploaded.url });
                                    } else if (uploaded?.dataUrl) {
                                      setFormData({ ...formData, logoUrl: uploaded.dataUrl });
                                    }
                                  }
                                } catch (e) {
                                  console.error("Upload failed", e);
                                }
                            }}
                        >
                            {formData.logoUrl ? (
                                <div className="flex items-center gap-3">
                                    <Image src={formData.logoUrl} alt="logo preview" className="h-10 w-10 rounded object-contain" />
                                    <span className="text-xs text-[rgba(255,255,255,0.7)]">Yeni görsel yüklendi</span>
                                </div>
                            ) : (
                                <span className="text-xs text-[rgba(255,255,255,0.6)]">PNG/JPG/WebP sürükleyip bırakın veya tıklayın</span>
                            )}
                        </Dropzone>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">Durum</label>
                        <select
                            value={formData.status || "draft"}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Project["status"] })}
                            className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-2 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none"
                        >
                            <option value="draft">Taslak</option>
                            <option value="in_progress">Geliştiriliyor</option>
                            <option value="on_hold">Beklemede</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="archived">Arşivlendi</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">Tür</label>
                        <select
                            value={(formData.type as ProjectType) || "other"}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                            className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-2 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none"
                        >
                            <option value="game">Oyun</option>
                            <option value="website">Web Sitesi</option>
                            <option value="tool">Araç</option>
                            <option value="other">Diğer</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-[rgba(0,167,197,0.3)]"
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[color:var(--color-turkish-blue-500)] text-black hover:bg-[color:var(--color-turkish-blue-400)]"
                        >
                            Kaydet
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
