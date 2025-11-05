"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as Tabs from "@radix-ui/react-tabs";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBlog, createBlogCategory, getAllBlogCategories, uploadImage, presignUpload } from "@/lib/db";
import type { BlogCategory } from "@/types/blog";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

// Lightweight MD editor (client-only)
type MDEProps = {
    value?: string;
    onChange?: (v?: string) => void;
    preview?: "edit" | "live" | "preview";
    height?: number;
    style?: React.CSSProperties;
};
const MDEditor = dynamic<MDEProps>(
    () =>
        import("@uiw/react-md-editor").then((m) =>
            (m.default as unknown) as React.ComponentType<MDEProps>
        ),
    { ssr: false }
);

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

function FloatingField({
    label,
    value,
    onChange,
    type = "text",
    required,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
}) {
    const hasValue = value && value.length > 0;
    return (
        <div className="relative">
            <Input
                type={type}
                value={value}
                required={required}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "peer bg-[rgba(3,12,18,0.75)] text-white placeholder-transparent",
                    "border border-[rgba(0,167,197,0.35)] focus:border-[rgba(0,167,197,0.8)]",
                    hasValue ? "border-[rgba(0,167,197,0.8)]" : ""
                )}
            />
            <label
                className={cn(
                    "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 transition-all",
                    "font-semibold",
                    hasValue ? "top-0" : "",
                )}
            >
                <span
                    className={cn(
                        "rounded-md px-1.5 py-0.5 text-sm text-[rgba(255,255,255,0.85)]",
                        "bg-[rgba(3,12,18,0.92)]",
                        "border",
                        hasValue
                            ? "border-[rgba(0,167,197,0.8)] text-[color:var(--color-turkish-blue-200)] text-[11px]"
                            : "border-transparent"
                    )}
                >
                    {label}
                </span>
            </label>
        </div>
    );
}

export default function BlogEditModal({ open, onClose, onCreated }: Props) {
    // wizard state
    const [step, setStep] = useState<number>(0);
    const next = () => setStep((s) => Math.min(s + 1, 3));
    const prev = () => setStep((s) => Math.max(s - 1, 0));

    // fields
    const [title, setTitle] = useState("");
    const [content, setContent] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    // author alanı kaldırıldı; backend token üzerinden belirleyecek
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (!open) return;
        getAllBlogCategories().then(setCategories).catch(() => setCategories([]));
    }, [open]);

    const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("authToken") : null), []);

    const toggleCategory = (name: string) => {
        setSelectedCategories((prev) =>
            prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    const handleCreateCategory = async () => {
        const name = newCategory.trim();
        if (!name) return;
        setCreatingCategory(true);
        try {
            const created = await createBlogCategory(name);
            if (created) {
                setCategories((prev) => [created, ...prev.filter((c) => c.name !== created.name)]);
                setSelectedCategories((prev) =>
                    prev.includes(created.name) ? prev : [...prev, created.name]
                );
                setNewCategory("");
            }
        } finally {
            setCreatingCategory(false);
        }
    };

    const canNext = () => {
        if (step === 0) return title.trim().length > 2;
        if (step === 1) return selectedCategories.length >= 0; // always ok
        if (step === 2) return content.trim().length > 10;
        if (step === 3) return true;
        return false;
    };

    const fileToDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Dosya okunamadı"));
            reader.readAsDataURL(file);
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        try {
            let imageToSend = image;
            if (!imageToSend && uploadFile) {
                // Prefer presigned upload (S3/MinIO) and fall back to dataUrl
                const ext = uploadFile.name.includes(".") ? uploadFile.name.split(".").pop() : undefined;
                try {
                    const presigned = await presignUpload({
                        contentType: uploadFile.type || "application/octet-stream",
                        extension: ext,
                        contentLength: uploadFile.size,
                        keyPrefix: "blog/",
                    }, token);
                    if (presigned) {
                        // PUT directly to object storage
                        const putRes = await fetch(presigned.url, {
                            method: presigned.method || "PUT",
                            headers: uploadFile.type ? { "Content-Type": uploadFile.type } : undefined,
                            body: uploadFile,
                        });
                        if (putRes.ok) {
                            imageToSend = presigned.publicUrl || presigned.url.split("?")[0];
                        }
                    }
                } catch { }
                if (!imageToSend) {
                    try {
                        const dataUrl = await fileToDataUrl(uploadFile);
                        const uploaded = await uploadImage(dataUrl, token);
                        imageToSend = uploaded?.url || uploaded?.dataUrl || "";
                    } catch {
                        imageToSend = "";
                    }
                }
            }
            await createBlog(
                {
                    title,
                    content,
                    image: imageToSend,
                    categories: selectedCategories,
                },
                token
            );
            onCreated?.();
            onClose();
            // reset
            setTitle("");
            setContent("");
            setImage("");
            setUploadFile(null);
            setSelectedCategories([]);
            setStep(0);
        } finally {
            setSubmitting(false);
        }
    };

    const FeaturedImageTabs = (
        <Tabs.Root defaultValue="url" className="w-full">
            <Tabs.List className="mb-3 inline-flex rounded-lg border border-[rgba(0,167,197,0.25)] bg-[rgba(3,12,18,0.6)] p-1 text-xs">
                <Tabs.Trigger value="url" className="rounded-md px-3 py-1 ui-selected:bg-[rgba(0,167,197,0.2)] ui-selected:text-[color:var(--color-turkish-blue-300)]">URL</Tabs.Trigger>
                <Tabs.Trigger value="upload" className="rounded-md px-3 py-1 ui-selected:bg-[rgba(0,167,197,0.2)] ui-selected:text-[color:var(--color-turkish-blue-300)]">Yükle</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="url" className="outline-none">
                <FloatingField label="Görsel URL" value={image} onChange={setImage} placeholder="https://..." />
            </Tabs.Content>
            <Tabs.Content value="upload" className="outline-none">
                <div className="rounded-lg border border-dashed border-[rgba(0,167,197,0.35)] bg-[rgba(3,12,18,0.4)] p-4 text-center text-sm text-gray-300">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-xs text-[rgba(255,255,255,0.8)]"
                    />
                    {uploadFile && (
                        <p className="mt-2 text-[rgba(255,255,255,0.7)]">Seçildi: {uploadFile.name}</p>
                    )}
                </div>
            </Tabs.Content>
            {(image || uploadFile) && (
                <div className="mt-3 rounded-lg border border-[rgba(0,167,197,0.25)] bg-[rgba(3,12,18,0.6)] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image || (uploadFile ? URL.createObjectURL(uploadFile) : "")}
                        alt="Önizleme"
                        className="mx-auto max-h-40 w-auto object-contain"
                    />
                </div>
            )}
        </Tabs.Root>
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.95)] backdrop-blur-2xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-300)]">
                        Yeni Blog Yazısı
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Stepper header */}
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-[rgba(0,167,197,0.25)] bg-[rgba(3,12,18,0.65)] p-3 text-xs">
                        {[
                            "Başlık",
                            "Kategoriler",
                            "İçerik",
                            "Öne Çıkan Görsel",
                        ].map((label, idx) => (
                            <div key={label} className="flex items-center gap-2">
                                <div className={cn(
                                    "grid h-6 w-6 place-items-center rounded-full border text-[10px]",
                                    idx <= step
                                        ? "border-[rgba(0,167,197,0.6)] bg-[rgba(0,167,197,0.15)] text-[color:var(--color-turkish-blue-300)]"
                                        : "border-[rgba(0,167,197,0.25)] text-[rgba(255,255,255,0.6)]"
                                )}>{idx + 1}</div>
                                <span className={cn(
                                    "hidden sm:inline",
                                    idx === step ? "text-[color:var(--color-turkish-blue-200)]" : "text-[rgba(255,255,255,0.6)]"
                                )}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Step bodies */}
                    {step === 0 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FloatingField label="Başlık" value={title} onChange={setTitle} required />
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Yeni kategori adı"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="max-w-[240px] border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                                />
                                <Button type="button" onClick={handleCreateCategory} disabled={creatingCategory} className="bg-[color:var(--color-turkish-blue-500)] text-black">
                                    {creatingCategory ? "Ekleniyor..." : "Kategori Ekle"}
                                </Button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => toggleCategory(cat.name)}
                                        className={cn(
                                            "px-3 py-1 rounded-full border text-xs",
                                            selectedCategories.includes(cat.name)
                                                ? "bg-[rgba(0,167,197,0.2)] text-[color:var(--color-turkish-blue-300)] border-[rgba(0,167,197,0.5)]"
                                                : "border-gray-700 text-gray-400 hover:border-[rgba(0,167,197,0.3)] hover:text-[color:var(--color-turkish-blue-300)]"
                                        )}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-2" data-color-mode="dark">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-[rgba(255,255,255,0.8)]">İçerik (Markdown)</label>
                                <button type="button" onClick={() => setShowPreview((p) => !p)} className="rounded-md border border-[rgba(0,167,197,0.35)] p-1 text-[rgba(255,255,255,0.8)] hover:text-[color:var(--color-turkish-blue-300)]">
                                    <Eye size={16} />
                                </button>
                            </div>
                            <div className="rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.6)] p-2">
                                <MDEditor value={content} onChange={(v = "") => setContent(v)} preview={showPreview ? "preview" : "edit"} height={320} style={{ background: "transparent" }} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-2">
                            <label className="text-sm text-[rgba(255,255,255,0.8)]">Öne Çıkan Görsel</label>
                            {FeaturedImageTabs}
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <Button type="button" variant="outline" onClick={prev} disabled={step === 0} className="border-[rgba(0,167,197,0.3)]">
                            Geri
                        </Button>
                        {step < 3 ? (
                            <Button type="button" onClick={next} disabled={!canNext()} className="bg-[color:var(--color-turkish-blue-500)] text-black hover:bg-[color:var(--color-turkish-blue-400)]">
                                İleri
                            </Button>
                        ) : (
                            <Button type="submit" disabled={submitting} className="bg-[color:var(--color-turkish-blue-500)] text-black hover:bg-[color:var(--color-turkish-blue-400)]">
                                {submitting ? "Kaydediliyor..." : "Yayınla"}
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
