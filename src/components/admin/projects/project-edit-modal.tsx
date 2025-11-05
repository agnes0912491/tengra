// src/components/admin/projects/project-edit-modal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Project, ProjectType } from "@/types/project";

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
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">Açıklama</label>
                        <textarea
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="min-h-[120px] w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-3 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none"
                            rows={5}
                        />
                    </div>

                    {/** Logo URL kaldırıldı */}

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