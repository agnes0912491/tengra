"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
    ArrowLeft,
    Save,
    Eye,
    EyeOff,
    Loader2,
    Upload,
    Clock,
    Send,
    FileText,
    Settings2,
    Monitor,
    Tablet,
    Smartphone,
} from "lucide-react";

import type { Blog, BlogCategory } from "@/types/blog";
import { createBlog, updateBlog, uploadImage, getAllBlogCategories } from "@/lib/db";
import { cn, slugify } from "@/lib/utils";
import RichEditor from "@/components/blog/editor/RichEditor";
import { AdminCard, AdminCardHeader, AdminInput, AdminTextarea, AdminSelect, AdminBadge } from "@/components/admin/ui";

type BlogEditorProps = {
    mode: "create" | "edit";
    initialBlog?: Blog;
};

type Draft = {
    id?: string;
    title: string;
    slug: string;
    subtitle?: string;
    status: Blog["status"];
    publishAt?: string;
    excerpt: string;
    content: string;
    image?: string;
    tags: string[];
    categories: string[];
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
};

const defaultDraft = (): Draft => ({
    title: "",
    slug: "",
    status: "draft",
    publishAt: "",
    excerpt: "",
    content: "",
    tags: [],
    categories: [],
});

const AUTOSAVE_DELAY = 30000; // 30 seconds

export default function BlogEditor({ mode, initialBlog }: BlogEditorProps) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("AdminBlogs");
    const [draft, setDraft] = useState<Draft>(() => {
        if (initialBlog) {
            return {
                id: initialBlog.id,
                title: initialBlog.title,
                slug: initialBlog.slug ?? slugify(initialBlog.title),
                subtitle: initialBlog.subtitle,
                status: initialBlog.status ?? "draft",
                publishAt: initialBlog.publishAt ?? "",
                excerpt: initialBlog.excerpt,
                content: initialBlog.content,
                image: initialBlog.image,
                tags: initialBlog.tags ?? [],
                categories: initialBlog.categories.map((c) => c.name),
                seoTitle: initialBlog.seo?.title,
                seoDescription: initialBlog.seo?.description,
                canonicalUrl: initialBlog.seo?.canonicalUrl,
            };
        }
        return defaultDraft();
    });

    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
    const [showSettings, setShowSettings] = useState(false);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [imageUploading, setImageUploading] = useState(false);
    const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

    // Load categories
    useEffect(() => {
        getAllBlogCategories().then(setCategories).catch(() => setCategories([]));
    }, []);

    // Autosave effect
    useEffect(() => {
        if (draft.title.trim() && draft.content.trim()) {
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
            autosaveTimer.current = setTimeout(() => {
                handleSave(true);
            }, AUTOSAVE_DELAY);
        }
        return () => {
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.title, draft.content]);

    const getToken = () => typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const handleSave = useCallback(async (isAutosave = false) => {
        if (!draft.title.trim() || !draft.content.trim()) {
            if (!isAutosave) toast.error(t("toast.titleContentRequired"));
            return;
        }

        const token = getToken();
        if (!token) {
            toast.error(t("toast.loginRequired"));
            return;
        }

        setSaving(true);
        try {
            const payload = {
                id: draft.id,
                title: draft.title,
                slug: draft.slug || slugify(draft.title),
                subtitle: draft.subtitle,
                status: draft.status,
                publishAt: draft.publishAt,
                excerpt: draft.excerpt,
                content: draft.content,
                image: draft.image,
                heroImage: draft.image,
                tags: draft.tags,
                categories: draft.categories,
                seo: {
                    title: draft.seoTitle,
                    description: draft.seoDescription,
                    canonicalUrl: draft.canonicalUrl,
                },
            };

            const saved = draft.id
                ? await updateBlog(draft.id, payload, token)
                : await createBlog(payload, token);

            if (!saved) {
                toast.error(t("toast.saveFailed"));
                return;
            }

            setDraft((prev) => ({ ...prev, id: saved.id }));
            setLastSaved(new Date());

            if (!isAutosave) {
                toast.success(t("toast.saveSuccess"));
                if (mode === "create" && saved.id) {
                    router.replace(`/admin/dashboard/blogs/${saved.id}/edit`);
                }
            }
        } catch (error) {
            console.error("Failed to save blog", error);
            if (!isAutosave) toast.error(t("toast.saveError"));
        } finally {
            setSaving(false);
        }
    }, [draft, mode, router, t]);

    const handleImageUpload = async (file?: File | null) => {
        if (!file) return;
        const token = getToken();
        if (!token) {
            toast.error(t("toast.imageLoginRequired"));
            return;
        }
        setImageUploading(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const dataUrl = String(reader.result ?? "");
                const uploaded = await uploadImage(dataUrl, token);
                if (uploaded?.url) {
                    setDraft((prev) => ({ ...prev, image: uploaded.url }));
                    toast.success(t("toast.coverUploadSuccess"));
                }
                setImageUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Upload failed", error);
            toast.error(t("toast.coverUploadFailed"));
            setImageUploading(false);
        }
    };

    const handlePublish = async () => {
        setDraft((prev) => ({ ...prev, status: "published" }));
        await handleSave(false);
        toast.success(t("toast.publishSuccess"));
    };

    const previewWidths = {
        desktop: "100%",
        tablet: "768px",
        mobile: "375px",
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-[rgba(72,213,255,0.1)] bg-[rgba(8,20,32,0.95)] backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-3 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/dashboard/blogs"
                            className="flex items-center gap-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">{t("editor.back")}</span>
                        </Link>
                        <div className="h-5 w-px bg-[rgba(255,255,255,0.1)]" />
                        <div>
                            <p className="text-xs text-[rgba(255,255,255,0.5)]">
                                {mode === "create" ? t("editor.modeCreate") : t("editor.modeEdit")}
                            </p>
                            <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-md">
                                {draft.title || t("editor.untitled")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {lastSaved && (
                            <span className="hidden sm:flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.4)]">
                                <Clock className="h-3.5 w-3.5" />
                                {lastSaved.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        )}

                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                showPreview
                                    ? "bg-[rgba(72,213,255,0.15)] text-[rgba(130,226,255,0.95)]"
                                    : "text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]"
                            )}
                            title={showPreview ? t("editor.previewClose") : t("editor.previewOpen")}
                        >
                            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                showSettings
                                    ? "bg-[rgba(72,213,255,0.15)] text-[rgba(130,226,255,0.95)]"
                                    : "text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]"
                            )}
                            title={t("editor.settings")}
                        >
                            <Settings2 className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.15)] text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 transition-all"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span className="hidden sm:inline">{t("editor.save")}</span>
                        </button>

                        {draft.status !== "published" && (
                            <button
                                onClick={handlePublish}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[rgba(72,213,255,0.9)] to-[rgba(0,167,197,0.9)] text-sm font-semibold text-black shadow-[0_4px_20px_rgba(0,167,197,0.3)] hover:brightness-110 disabled:opacity-50 transition-all"
                            >
                                <Send className="h-4 w-4" />
                                <span className="hidden sm:inline">{t("editor.publish")}</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Editor */}
                <main className={cn("flex-1 p-6 lg:p-10 transition-all", showPreview && "lg:w-1/2")}>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Cover Image */}
                        {draft.image ? (
                            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden group">
                                <Image
                                    src={draft.image}
                                    alt={t("editor.coverAlt")}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm">
                                        <Upload className="h-4 w-4" />
                                        {t("editor.changeCover")}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e.target.files?.[0])}
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.5)] cursor-pointer hover:border-[rgba(72,213,255,0.4)] transition-colors">
                                {imageUploading ? (
                                    <Loader2 className="h-8 w-8 text-[rgba(130,226,255,0.6)] animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-[rgba(130,226,255,0.6)] mb-2" />
                                        <p className="text-sm text-[rgba(255,255,255,0.5)]">{t("editor.addCover")}</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                                />
                            </label>
                        )}

                        {/* Title */}
                        <input
                            value={draft.title}
                            onChange={(e) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                    slug: prev.slug || slugify(e.target.value),
                                }))
                            }
                            placeholder={t("editor.titlePlaceholder")}
                            className="w-full bg-transparent text-3xl lg:text-4xl font-bold text-white placeholder:text-[rgba(255,255,255,0.25)] outline-none"
                        />

                        {/* Subtitle */}
                        <input
                            value={draft.subtitle ?? ""}
                            onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
                            placeholder={t("editor.subtitlePlaceholder")}
                            className="w-full bg-transparent text-lg text-[rgba(255,255,255,0.7)] placeholder:text-[rgba(255,255,255,0.25)] outline-none"
                        />

                        {/* Content Editor */}
                        <div className="min-h-[400px] rounded-2xl border border-[rgba(72,213,255,0.1)] bg-[rgba(8,18,26,0.5)] p-4">
                            <RichEditor
                                content={draft.content}
                                onChange={(v) => setDraft((prev) => ({ ...prev, content: v }))}
                                placeholder={t("editor.contentPlaceholder")}
                                userToken={getToken() ?? undefined}
                            />
                        </div>
                    </div>
                </main>

                {/* Preview Panel */}
                {showPreview && (
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden lg:flex flex-col w-1/2 border-l border-[rgba(72,213,255,0.1)] bg-[rgba(12,24,36,0.5)]"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                            <span className="text-sm font-medium text-[rgba(255,255,255,0.7)]">{t("editor.previewLabel")}</span>
                            <div className="flex items-center gap-1">
                                {(["desktop", "tablet", "mobile"] as const).map((device) => (
                                    <button
                                        key={device}
                                        onClick={() => setPreviewDevice(device)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            previewDevice === device
                                                ? "bg-[rgba(72,213,255,0.15)] text-[rgba(130,226,255,0.95)]"
                                                : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.7)]"
                                        )}
                                    >
                                        {device === "desktop" && <Monitor className="h-4 w-4" />}
                                        {device === "tablet" && <Tablet className="h-4 w-4" />}
                                        {device === "mobile" && <Smartphone className="h-4 w-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex justify-center">
                            <div
                                className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all"
                                style={{ width: previewWidths[previewDevice], maxWidth: "100%" }}
                            >
                                <article className="p-8">
                                    {draft.image && (
                                        <div className="relative aspect-[2/1] rounded-lg overflow-hidden mb-6">
                                            <Image src={draft.image} alt="" fill className="object-cover" unoptimized />
                                        </div>
                                    )}
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {draft.title || t("editor.previewTitlePlaceholder")}
                                    </h1>
                                    {draft.subtitle && (
                                        <p className="text-lg text-gray-600 mb-4">{draft.subtitle}</p>
                                    )}
                                    <div
                                        className="prose prose-slate max-w-none"
                                        dangerouslySetInnerHTML={{ __html: draft.content || `<p>${t("editor.previewContentPlaceholder")}</p>` }}
                                    />
                                </article>
                            </div>
                        </div>
                    </motion.aside>
                )}

                {/* Settings Panel */}
                {showSettings && (
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-80 border-l border-[rgba(72,213,255,0.1)] bg-[rgba(8,20,32,0.95)] overflow-y-auto"
                    >
                        <div className="p-4 space-y-4">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {t("editor.settingsTitle")}
                            </h3>

                            <AdminInput
                                label={t("editor.slugLabel")}
                                value={draft.slug}
                                onChange={(e) => setDraft((prev) => ({ ...prev, slug: slugify(e.currentTarget.value) }))}
                                placeholder={t("editor.slugPlaceholder")}
                            />

                            <AdminSelect
                                label={t("editor.statusLabel")}
                                value={draft.status ?? "draft"}
                                onChange={(e) => setDraft((prev) => ({ ...prev, status: e.currentTarget.value as Draft["status"] }))}
                                options={[
                                    { value: "draft", label: t("status.draft") },
                                    { value: "published", label: t("status.published") },
                                    { value: "scheduled", label: t("status.scheduled") },
                                ]}
                            />

                            <AdminInput
                                label={t("editor.publishDateLabel")}
                                type="datetime-local"
                                value={draft.publishAt ?? ""}
                                onChange={(e) => setDraft((prev) => ({ ...prev, publishAt: e.currentTarget.value }))}
                            />

                            <AdminTextarea
                                label={t("editor.excerptLabel")}
                                value={draft.excerpt}
                                onChange={(e) => setDraft((prev) => ({ ...prev, excerpt: e.currentTarget.value }))}
                                placeholder={t("editor.excerptPlaceholder")}
                                rows={3}
                            />

                            <AdminInput
                                label={t("editor.tagsLabel")}
                                value={draft.tags.join(", ")}
                                onChange={(e) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        tags: e.currentTarget.value.split(",").map((t) => t.trim()).filter(Boolean),
                                    }))
                                }
                                placeholder={t("editor.tagsPlaceholder")}
                                hint={t("editor.tagsHint")}
                            />

                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-[rgba(255,255,255,0.6)]">
                                    {t("editor.categoriesLabel")}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => {
                                        const active = draft.categories.includes(cat.name);
                                        return (
                                            <button
                                                key={cat.slug ?? cat.name}
                                                type="button"
                                                onClick={() =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        categories: active
                                                            ? prev.categories.filter((c) => c !== cat.name)
                                                            : [...prev.categories, cat.name],
                                                    }))
                                                }
                                            >
                                                <AdminBadge variant={active ? "info" : "default"} size="md">
                                                    {cat.name}
                                                </AdminBadge>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                                <h4 className="text-xs font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-3">
                                    {t("editor.seoLabel")}
                                </h4>
                                <div className="space-y-3">
                                    <AdminInput
                                        label={t("editor.seoTitleLabel")}
                                        value={draft.seoTitle ?? ""}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, seoTitle: e.currentTarget.value }))}
                                        placeholder={draft.title}
                                    />
                                    <AdminTextarea
                                        label={t("editor.seoDescriptionLabel")}
                                        value={draft.seoDescription ?? ""}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, seoDescription: e.currentTarget.value }))}
                                        placeholder={draft.excerpt}
                                        rows={2}
                                    />
                                    <AdminInput
                                        label={t("editor.canonicalLabel")}
                                        value={draft.canonicalUrl ?? ""}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, canonicalUrl: e.currentTarget.value }))}
                                        placeholder={t("editor.canonicalPlaceholder")}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </div>
        </div>
    );
}
