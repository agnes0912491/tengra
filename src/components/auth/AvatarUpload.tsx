"use client";

import { useTranslation } from "@tengra/language";
import { Trash2, ImagePlus } from "lucide-react";
import Image from "next/image";
import Dropzone from "@/components/ui/dropzone";

interface AvatarUploadProps {
    preview: string | null;
    error: string | null;
    success: boolean;
    onDrop: (files: File[]) => void;
    onClear: () => void;
}

export function AvatarUpload({ preview, error, success, onDrop, onClear }: AvatarUploadProps) {
    const { t } = useTranslation("Auth");

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
                {t("register.avatar.label")}
            </label>
            <Dropzone accept={{ "image/*": [] }} onDrop={onDrop}>
                <div className="flex w-full items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border border-[rgba(72,213,255,0.2)] bg-[rgba(30,184,255,0.08)] flex items-center justify-center">
                        {preview ? (
                            <Image src={preview} alt="Avatar preview" fill className="object-cover" />
                        ) : (
                            <ImagePlus className="w-6 h-6 text-[var(--text-muted)]" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-[var(--text-secondary)]">{t("register.avatar.helper")}</p>
                        <p className="text-xs text-[var(--text-muted)]">{t("register.avatar.hint")}</p>
                    </div>
                    {preview ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                            aria-label={t("register.avatar.remove")}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    ) : null}
                </div>
            </Dropzone>
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            {success ? (
                <p className="text-xs text-green-400 break-all">
                    {t("register.avatar.uploaded")}
                </p>
            ) : null}
        </div>
    );
}
