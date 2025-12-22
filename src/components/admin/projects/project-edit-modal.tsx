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
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";
import { toast } from "@/lib/react-toastify";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (project: Project) => void;
};

export default function ProjectEditModal({ open, onClose, onSave }: Props) {
    const t = useTranslations("AdminProjects");
    const [formData, setFormData] = useState<Partial<Project>>({
        name: "",
        status: "draft",
        type: "other",
    });
    const [descriptionsByLocale, setDescriptionsByLocale] = useState<Record<string, string>>({});

    const locales = routing.locales;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            return;
        }

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

        onSave({
            ...formData,
            description,
        } as Project);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl border border-[rgba(110,211,225,0.25)] bg-[rgba(6,18,26,0.9)] shadow-[0_22px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-300)]">
                        {t("labels.newProject")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("fields.name")}</label>
                        <Input
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                            className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                            required
                        />
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
                                    onChange={(e) => {
                                        const value = e.currentTarget.value;
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
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("fields.logoUpload")}</label>
                        <Dropzone
                            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] }}
                            onDrop={async (files) => {
                                const file = files[0];
                                if (!file) return;
                                const token =
                                    typeof window !== "undefined"
                                        ? ADMIN_SESSION_COOKIE_CANDIDATES.map((name) => Cookies.get(name)).find(Boolean) ||
                                        localStorage.getItem("authToken")
                                        : null;
                                const toDataUrl = (f: File) =>
                                    new Promise<string>((resolve) => {
                                        const reader = new FileReader();
                                        reader.onload = () => resolve(String(reader.result || ""));
                                        reader.readAsDataURL(f);
                                    });
                                const dataUrl = await toDataUrl(file);
                                try {
                                    if (!token) {
                                        console.error("Upload failed: missing auth token");
                                        toast.error(t("toast.uploadAuthRequired"));
                                        return;
                                    }
                                    const uploaded = await uploadImage(dataUrl, token);
                                    if (uploaded?.url) {
                                        setFormData((prev) => ({ ...prev, logoUrl: uploaded.url }));
                                    } else if (uploaded?.dataUrl) {
                                        setFormData((prev) => ({ ...prev, logoUrl: uploaded.dataUrl }));
                                    } else {
                                        toast.error(t("toast.imageUploadFailed"));
                                    }
                                } catch (e) {
                                    console.error("Upload failed", e);
                                    toast.error(t("toast.imageUploadError"));
                                }
                            }}
                        >
                            {formData.logoUrl ? (
                                <div className="flex items-center gap-3">
                                    <Image crossOrigin="anonymous"
                                        src={formData.logoUrl}
                                        alt={t("fields.logoPreview")}
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 rounded object-contain"
                                    />
                                    <span className="text-xs text-[rgba(255,255,255,0.7)]">{t("fields.logoUploaded")}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-[rgba(255,255,255,0.6)]">{t("fields.logoHint")}</span>
                            )}
                        </Dropzone>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("fields.status")}</label>
                        <select
                            value={formData.status || "draft"}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Project["status"] })}
                            className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-2 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none"
                        >
                            <option value="draft">{t("status.draft")}</option>
                            <option value="in_progress">{t("status.inProgress")}</option>
                            <option value="on_hold">{t("status.onHold")}</option>
                            <option value="completed">{t("status.completed")}</option>
                            <option value="archived">{t("status.archived")}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("fields.type")}</label>
                        <select
                            value={(formData.type as ProjectType) || "other"}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                            className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] p-2 text-white focus:border-[rgba(0,167,197,0.6)] focus:outline-none"
                        >
                            <option value="game">{t("types.game")}</option>
                            <option value="website">{t("types.website")}</option>
                            <option value="tool">{t("types.tool")}</option>
                            <option value="other">{t("types.other")}</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-[rgba(0,167,197,0.3)]"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[color:var(--color-turkish-blue-500)] text-black hover:bg-[color:var(--color-turkish-blue-400)]"
                        >
                            {t("actions.save")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
