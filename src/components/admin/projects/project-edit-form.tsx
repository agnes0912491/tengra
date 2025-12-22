"use client";

import { Button } from "@/components/ui/button";
import type { Project, ProjectPlatform, ProjectScreenshot, ProjectFeature, ProjectLink, ProjectType, ProjectStatus } from "@/types/project";
import {
    ArrowLeft,
    Trash2,
    Plus,
    Download,
    Image as ImageIcon,
    Globe,
    Smartphone,
    Monitor,
    Apple,
    Play,
    X,
    GripVertical,
    Sparkles,
    Link as LinkIcon,
    Package,
    LayoutGrid,
    ChevronRight,
    Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useTransition, useCallback } from "react";
import { editProject as ep, deleteProject as dp, uploadImage, uploadProjectImage, createProject as cpApi } from "@/lib/db";
import { toast } from "@/lib/react-toastify";
import Dropzone from "@/components/ui/dropzone";
import { routing } from "@/i18n/routing";
import { useAdminToken } from "@/hooks/use-admin-token";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Platform icons & labels
const platformConfig: Record<string, { labelKey: string; icon: React.ReactNode }> = {
    windows: { labelKey: "platforms.windows", icon: <Monitor className="h-4 w-4" /> },
    macos: { labelKey: "platforms.macos", icon: <Apple className="h-4 w-4" /> },
    linux: { labelKey: "platforms.linux", icon: <Monitor className="h-4 w-4" /> },
    ios: { labelKey: "platforms.ios", icon: <Smartphone className="h-4 w-4" /> },
    android: { labelKey: "platforms.android", icon: <Play className="h-4 w-4" /> },
    web: { labelKey: "platforms.web", icon: <Globe className="h-4 w-4" /> },
};

const allPlatforms: ProjectPlatform[] = ["windows", "macos", "linux", "ios", "android", "web"];
const allCategories = ["game", "productivity", "entertainment", "education", "utility", "social", "other"];

const statusOptions: { value: ProjectStatus; labelKey: string; color: string }[] = [
    { value: "draft", labelKey: "status.draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/20" },
    { value: "in_progress", labelKey: "status.inProgress", color: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
    { value: "on_hold", labelKey: "status.onHold", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20" },
    { value: "completed", labelKey: "status.completed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
    { value: "archived", labelKey: "status.archived", color: "bg-red-500/20 text-red-400 border-red-500/20" },
];

const typeOptions: { value: ProjectType; labelKey: string }[] = [
    { value: "game", labelKey: "types.game" },
    { value: "website", labelKey: "types.website" },
    { value: "tool", labelKey: "types.tool" },
    { value: "app", labelKey: "types.app" },
    { value: "library", labelKey: "types.library" },
    { value: "other", labelKey: "types.other" },
];

type Props = {
    project: Project | null;
    isNew: boolean;
};

// Define a strict interface for the editable state
interface EditableProject {
    id?: string;
    name?: string;
    tagline?: string;
    status?: ProjectStatus;
    type?: ProjectType;
    version?: string;
    platforms?: ProjectPlatform[];
    categories?: string[];
    screenshots?: ProjectScreenshot[];
    features?: ProjectFeature[];
    links?: ProjectLink[];
    logoUrl?: string;
    description?: string | object;
    descriptionsByLocale?: Record<string, string>;
}

type TabId = "general" | "media" | "features" | "links";

const tabs: { id: TabId; labelKey: string; icon: React.ReactNode }[] = [
    { id: "general", labelKey: "tabs.general", icon: <Package className="h-4 w-4" /> },
    { id: "media", labelKey: "tabs.media", icon: <ImageIcon className="h-4 w-4" /> },
    { id: "features", labelKey: "tabs.features", icon: <Sparkles className="h-4 w-4" /> },
    { id: "links", labelKey: "tabs.links", icon: <LinkIcon className="h-4 w-4" /> },
];

export default function ProjectEditForm({ project, isNew }: Props) {
    const router = useRouter();
    const t = useTranslations("AdminProjects");
    const locales = routing.locales;
    const { token } = useAdminToken();
    const [activeTab, setActiveTab] = useState<TabId>("general");
    const [logoUploading, setLogoUploading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const StatusBadge = ({ status }: { status: string }) => {
        const opt = statusOptions.find(o => o.value === status) || statusOptions[0];
        return (
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", opt.color)}>
                {t(opt.labelKey)}
            </span>
        );
    };

    // Initial State Setup
    const parseDescription = useCallback((description?: string | object | null | React.ReactNode): Record<string, string> => {
        if (!description) return {};
        if (typeof description === "object") {
            // It could be a ReactNode (which is an object) or our localized object
            // Safer to check for known keys or simple object structure if possible
            // But for now, we assume if it has locale keys, it's our description map
            const result: Record<string, string> = {};
            const descObj = description as Record<string, unknown>;

            // Check if it's a React element (basic check)
            if ('$$typeof' in descObj) {
                return {}; // React node, can't parse as locale map easily
            }

            for (const loc of locales) {
                if (typeof descObj[loc] === "string") {
                    result[loc] = descObj[loc] as string;
                }
            }
            return result;
        }
        try {
            const parsed = JSON.parse(description as string);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                const result: Record<string, string> = {};
                for (const loc of locales) {
                    if (typeof parsed[loc] === "string") {
                        result[loc] = parsed[loc];
                    }
                }
                return result;
            }
            return { [locales[0]]: description as string };
        } catch {
            return { [locales[0]]: description as string };
        }
    }, [locales]);

    const [logoPreview, setLogoPreview] = useState<string | null>(project?.logoUrl ?? null);

    // Helper to separate logic for creating the initial data object
    const getInitialData = useCallback((): EditableProject => {
        if (isNew) {
            return {
                name: "",
                status: "draft" as ProjectStatus,
                type: "other" as ProjectType,
                platforms: [] as ProjectPlatform[],
                categories: [] as string[],
                screenshots: [] as ProjectScreenshot[],
                features: [] as ProjectFeature[],
                links: [] as ProjectLink[],
                descriptionsByLocale: {} as Record<string, string>,
                // Initialize other required fields as undefined or defaults
                tagline: "",
                version: "",
            };
        }
        return {
            ...project,
            descriptionsByLocale: parseDescription(project?.description),
        } as EditableProject;
    }, [isNew, project, parseDescription]);

    const [editData, setEditData] = useState<EditableProject>(getInitialData);

    // Compute a normalized string for comparison
    const normalizeForComparison = useCallback((data: EditableProject) => {
        const clone = JSON.parse(JSON.stringify(data));

        // Ensure description is always an object for comparison consistency
        if (clone.descriptionsByLocale && Object.keys(clone.descriptionsByLocale).length === 0) {
            clone.descriptionsByLocale = {};
        }

        clone.platforms = clone.platforms || [];
        clone.categories = clone.categories || [];
        clone.screenshots = clone.screenshots || [];
        clone.features = clone.features || [];
        clone.links = clone.links || [];

        clone.platforms.sort();
        clone.categories.sort();
        clone.screenshots.sort((a: ProjectScreenshot, b: ProjectScreenshot) => (a.url || "").localeCompare(b.url || ""));
        clone.features.sort((a: ProjectFeature, b: ProjectFeature) => (a.title || "").localeCompare(b.title || ""));
        clone.links.sort((a: ProjectLink, b: ProjectLink) => (a.type || "").localeCompare(b.type || ""));

        return JSON.stringify({
            ...clone,
            name: clone.name || "",
            // Use descriptionsByLocale for comparison, exclude raw description if present
            description: Object.keys(clone.descriptionsByLocale || {}).length > 0 ? clone.descriptionsByLocale : "",
            descriptionsByLocale: undefined,
            logoUrl: logoPreview || undefined, // Compare against current logoPreview
        });
    }, [logoPreview]);

    // Calculate initial state string ONCE using the initial data
    const [initialState] = useState<string>(() => {
        const data = getInitialData();
        // Manual normalization similar to normalizeForComparison but without depending on logoPreview state
        const clone = JSON.parse(JSON.stringify(data));

        if (clone.descriptionsByLocale && Object.keys(clone.descriptionsByLocale).length === 0) {
            clone.descriptionsByLocale = {};
        }
        clone.platforms = clone.platforms || [];
        clone.categories = clone.categories || [];
        clone.screenshots = clone.screenshots || [];
        clone.features = clone.features || [];
        clone.links = clone.links || [];

        clone.platforms.sort();
        clone.categories.sort();
        clone.screenshots.sort((a: ProjectScreenshot, b: ProjectScreenshot) => (a.url || "").localeCompare(b.url || ""));
        clone.features.sort((a: ProjectFeature, b: ProjectFeature) => (a.title || "").localeCompare(b.title || ""));
        clone.links.sort((a: ProjectLink, b: ProjectLink) => (a.type || "").localeCompare(b.type || ""));

        return JSON.stringify({
            ...clone,
            name: clone.name || "",
            description: Object.keys(clone.descriptionsByLocale || {}).length > 0 ? clone.descriptionsByLocale : "",
            descriptionsByLocale: undefined,
            logoUrl: project?.logoUrl || undefined,
        });
    });

    // Check dirty state by comparing current normalized data with initial state string
    const isDirty = normalizeForComparison(editData) !== initialState;

    // Image Upload
    const handleImageUpload = async (file: File, uploader = uploadImage): Promise<string | null> => {
        if (!token) {
            toast.error(t("toast.authError"));
            return null;
        }
        try {
            const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ""));
                reader.readAsDataURL(file);
            });
            const result = await uploader(dataUrl, token);
            return result?.url || null;
        } catch {
            toast.error(t("toast.imageUploadFailed"));
            return null;
        }
    };

    const handleLogoDrop = async (files: File[]) => {
        setLogoUploading(true);
        const url = await handleImageUpload(files[0], uploadProjectImage);
        if (url) {
            setLogoPreview(url);
            setEditData(prev => ({ ...prev, logoUrl: url }));
        }
        setLogoUploading(false);
    };

    // Form Actions
    const handleSave = async () => {
        if (!token) return toast.error(t("toast.unauthorized"));

        const cleanedDescriptions: Record<string, string> = {};
        if (editData.descriptionsByLocale) {
            Object.entries(editData.descriptionsByLocale).forEach(([loc, value]) => {
                if (typeof value === "string" && value.trim()) {
                    cleanedDescriptions[loc] = value;
                }
            });
        }

        const payload = {
            ...editData,
            name: editData.name || "",
            description: Object.keys(cleanedDescriptions).length > 0 ? cleanedDescriptions : "",
            logoUrl: logoPreview || undefined,
        } as Project;

        startTransition(async () => {
            try {
                if (isNew) {
                    const created = await cpApi(payload, token);
                    if (created && 'id' in created && created.id) {
                        toast.success(t("toast.createSuccess"));
                        router.push(`/admin/dashboard/projects/${created.id}`);
                    } else {
                        toast.error(t("toast.createFailed"));
                    }
                } else {
                    const updated = await ep(payload, project?.id as string, token);
                    if (updated) {
                        toast.success(t("toast.saveSuccess"));
                        // Re-sync local state logic if needed, but router refresh will update Props
                        router.refresh();
                    } else {
                        toast.error(t("toast.saveFailed"));
                    }
                }
            } catch {
                toast.error(t("toast.genericError"));
            }
        });
    };

    const handleDelete = async () => {
        if (!token || !project?.id) return;
        setDeleteConfirm(false);
        startTransition(async () => {
            const success = await dp(project.id as string, token);
            if (success) {
                toast.success(t("toast.deleteSuccess"));
                router.push("/admin/dashboard/projects");
            } else {
                toast.error(t("toast.deleteFailed"));
            }
        });
    };

    // UI Helpers
    const toggleArrayItem = <T extends string>(arr: T[] | undefined, item: T): T[] => {
        const current = arr || [];
        return current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    };


    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f18] to-black text-white selection:bg-cyan-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-black/60 border-b border-white/5">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard/projects">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                                <ArrowLeft className="h-5 w-5 text-slate-400" />
                            </Button>
                        </Link>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                    {editData.name || t("labels.newProject")}
                                </h1>
                                {editData.status && <StatusBadge status={editData.status} />}
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                                {t("labels.id")}: {isNew ? t("labels.newId") : project?.id}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 pb-24">
                {/* Sidebar Navigation */}
                <nav className="space-y-1 lg:sticky lg:top-28 h-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                activeTab === tab.id
                                    ? "bg-[color:var(--color-turkish-blue-500)]/10 text-[color:var(--color-turkish-blue-400)] shadow-lg shadow-black/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <span className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg",
                                activeTab === tab.id ? "bg-[color:var(--color-turkish-blue-500)]/20" : "bg-white/5"
                            )}>
                                {tab.icon}
                            </span>
                            {t(tab.labelKey)}
                            {activeTab === tab.id && (
                                <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className="min-h-[600px] relative">

                    <AnimatePresence mode="wait">

                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* GENERAL TAB */}
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    {/* Main Info Card */}
                                    <div className="grid gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
                                        <div className="flex gap-6 items-start">
                                            {/* Logo Upload */}
                                            <div className="shrink-0 w-32">
                                                <label className="block text-xs font-medium text-slate-400 mb-2 ml-1">{t("fields.logo")}</label>
                                                {/* Dashed Border & Centered Icon */}
                                                <div className="group relative w-32 h-32 rounded-2xl border-2 border-dashed border-white/20 bg-black/20 hover:border-[color:var(--color-turkish-blue-500)]/50 transition-all overflow-hidden flex flex-col items-center justify-center text-slate-500 hover:text-[color:var(--color-turkish-blue-400)]">
                                                    {logoPreview ? (
                                                        <>
                                                            <Image src={logoPreview} alt={t("fields.logo")} fill className="object-contain p-4" unoptimized />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                                                                <Button
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setEditData(prev => ({ ...prev, logoUrl: undefined })) }}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <Dropzone
                                                            accept={{ "image/*": [".png", ".jpg", ".webp"] }}
                                                            onDrop={handleLogoDrop}
                                                        >
                                                            <div className="flex flex-col items-center justify-center h-full w-full gap-2 cursor-pointer p-2">
                                                                <Upload className="h-6 w-6" />
                                                                <span className="text-[10px] text-center font-medium">{t("actions.upload")}</span>
                                                            </div>
                                                        </Dropzone>
                                                    )}
                                                    {logoUploading && (
                                                        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                                                            <div className="w-6 h-6 border-2 border-[color:var(--color-turkish-blue-500)] border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Basic Inputs */}
                                            <div className="flex-1 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-400 ml-1">{t("fields.name")}</label>
                                                        <Input
                                                            value={editData.name || ""}
                                                            onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                                            placeholder={t("placeholders.name")}
                                                            className="bg-black/20 border-white/10 focus:border-[color:var(--color-turkish-blue-500)]/50 h-10 rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-400 ml-1">{t("fields.tagline")}</label>
                                                        <Input
                                                            value={editData.tagline || ""}
                                                            onChange={e => setEditData(prev => ({ ...prev, tagline: e.target.value }))}
                                                            placeholder={t("placeholders.tagline")}
                                                            className="bg-black/20 border-white/10 focus:border-[color:var(--color-turkish-blue-500)]/50 h-10 rounded-lg"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-400 ml-1">{t("fields.status")}</label>
                                                        <select
                                                            value={editData.status || "draft"}
                                                            onChange={e => setEditData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                                                            className="w-full h-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[color:var(--color-turkish-blue-500)]/50"
                                                        >
                                                            {statusOptions.map(opt => (
                                                                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-slate-400 ml-1">{t("fields.type")}</label>
                                                        <select
                                                            value={editData.type || "other"}
                                                            onChange={e => setEditData(prev => ({ ...prev, type: e.target.value as ProjectType }))}
                                                            className="w-full h-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-[color:var(--color-turkish-blue-500)]/50"
                                                        >
                                                            {typeOptions.map(opt => (
                                                                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5 col-span-2">
                                                        <label className="text-xs font-medium text-slate-400 ml-1">{t("fields.version")}</label>
                                                        <Input
                                                            value={editData.version || ""}
                                                            onChange={e => setEditData(prev => ({ ...prev, version: e.target.value }))}
                                                            placeholder="1.0.0"
                                                            className="bg-black/20 border-white/10 focus:border-[color:var(--color-turkish-blue-500)]/50 h-10 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Localized Descriptions */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                                                {locales.map(locale => (
                                                    <div key={locale} className="flex-1 text-center text-xs font-medium text-slate-400 uppercase tracking-widest">{locale}</div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {locales.map(locale => (
                                                    <div key={locale} className="space-y-2 group">
                                                        <label className="text-xs font-medium text-[color:var(--color-turkish-blue-400)] ml-1 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-turkish-blue-500)]" />
                                                            {t("fields.descriptionForLocale", { locale: locale.toUpperCase() })}
                                                        </label>
                                                        <textarea
                                                            value={editData.descriptionsByLocale?.[locale] || ""}
                                                            onChange={e => setEditData(prev => ({
                                                                ...prev,
                                                                descriptionsByLocale: {
                                                                    ...prev.descriptionsByLocale,
                                                                    [locale]: e.target.value
                                                                }
                                                            }))}
                                                            placeholder={t("placeholders.descriptionForLocale", { locale: locale.toUpperCase() })}
                                                            className="w-full h-40 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-[color:var(--color-turkish-blue-500)]/50 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-turkish-blue-500)]/50 resize-y transition-all"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Config Section (Platforms & Categories) */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                                <LayoutGrid className="h-4 w-4 text-[color:var(--color-turkish-blue-400)]" />
                                                {t("sections.platforms")}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {allPlatforms.map(platform => (
                                                    <button
                                                        key={platform}
                                                        onClick={() => setEditData(prev => ({ ...prev, platforms: toggleArrayItem(prev.platforms, platform) }))}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all",
                                                            editData.platforms?.includes(platform)
                                                                ? "bg-[color:var(--color-turkish-blue-500)]/20 border-[color:var(--color-turkish-blue-500)]/50 text-[color:var(--color-turkish-blue-300)]"
                                                                : "bg-black/20 border-transparent text-slate-500 hover:bg-white/5"
                                                        )}
                                                    >
                                                        {platformConfig[platform]?.icon}
                                                        {t(platformConfig[platform]?.labelKey)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-[color:var(--color-turkish-blue-400)]" />
                                                {t("sections.categories")}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {allCategories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setEditData(prev => ({ ...prev, categories: toggleArrayItem(prev.categories, cat) }))}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                                            editData.categories?.includes(cat)
                                                                ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                                                : "bg-black/20 border-transparent text-slate-500 hover:bg-white/5"
                                                        )}
                                                    >
                                                        #{t(`categories.${cat}`)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MEDIA TAB */}
                            {activeTab === "media" && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{t("sections.screenshots.title")}</h3>
                                                <p className="text-sm text-slate-500">{t("sections.screenshots.subtitle")}</p>
                                            </div>
                                            <Button onClick={() => setEditData(prev => ({ ...prev, screenshots: [...(prev.screenshots || []), { url: "", caption: "", order: (prev.screenshots?.length || 0) + 1 }] }))}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                {t("actions.add")}
                                            </Button>
                                        </div>


                                        <Reorder.Group axis="y" values={editData.screenshots || []} onReorder={(v) => setEditData(prev => ({ ...prev, screenshots: v }))} className="space-y-3">
                                            {(editData.screenshots || []).map((ss: ProjectScreenshot, idx: number) => (

                                                <Reorder.Item key={idx} value={ss} className="flex gap-4 p-4 rounded-xl bg-black/20 border border-white/5 items-start group">
                                                    <div className="mt-2 cursor-grab active:cursor-grabbing text-slate-600 hover:text-white">
                                                        <GripVertical className="h-5 w-5" />
                                                    </div>
                                                    <div className="w-40 aspect-video rounded-lg bg-black/40 border border-white/5 relative overflow-hidden shrink-0">
                                                        {ss.url ? (
                                                            <Image src={ss.url} alt="" fill className="object-cover" unoptimized />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-slate-600">
                                                                <ImageIcon className="h-8 w-8 opacity-50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <Input
                                                            value={ss.url}
                                                            onChange={e => {
                                                                const newSS = [...(editData.screenshots || [])];
                                                                newSS[idx].url = e.target.value;
                                                                setEditData(prev => ({ ...prev, screenshots: newSS }));
                                                            }}
                                                            placeholder={t("placeholders.screenshotUrl")}
                                                            className="bg-black/20 border-white/10"
                                                        />
                                                        <Input
                                                            value={ss.caption || ""}
                                                            onChange={e => {
                                                                const newSS = [...(editData.screenshots || [])];
                                                                newSS[idx].caption = e.target.value;
                                                                setEditData(prev => ({ ...prev, screenshots: newSS }));
                                                            }}
                                                            placeholder={t("placeholders.screenshotCaption")}
                                                            className="bg-black/20 border-white/10 text-xs"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const newSS = (editData.screenshots || []).filter((_, i) => i !== idx);
                                                            setEditData(prev => ({ ...prev, screenshots: newSS }));
                                                        }}
                                                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </div>
                                </div>
                            )}

                            {/* FEATURES TAB */}
                            {activeTab === "features" && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{t("sections.features.title")}</h3>
                                                <p className="text-sm text-slate-500">{t("sections.features.subtitle")}</p>
                                            </div>
                                            <Button onClick={() => setEditData(prev => ({ ...prev, features: [...(prev.features || []), { title: "", description: "", icon: "", order: (prev.features?.length || 0) + 1 }] }))}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                {t("actions.addFeature")}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(editData.features || []).map((feat, idx) => (
                                                <div key={idx} className="group p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-[color:var(--color-turkish-blue-500)]/30 transition-colors relative">
                                                    <div className="flex gap-4">
                                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-[color:var(--color-turkish-blue-500)]/10 flex items-center justify-center text-xl border border-[color:var(--color-turkish-blue-500)]/20">
                                                            <Input
                                                                value={feat.icon || ""}
                                                                onChange={e => {
                                                                    const newFeat = [...(editData.features || [])];
                                                                    newFeat[idx].icon = e.target.value;
                                                                    setEditData(prev => ({ ...prev, features: newFeat }));
                                                                }}
                                                                className="w-full h-full text-center bg-transparent border-none focus:ring-0 p-0 text-xl"
                                                                placeholder="🚀"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <Input
                                                                value={feat.title}
                                                                onChange={e => {
                                                                    const newFeat = [...(editData.features || [])];
                                                                    newFeat[idx].title = e.target.value;
                                                                    setEditData(prev => ({ ...prev, features: newFeat }));
                                                                }}
                                                                placeholder={t("placeholders.featureTitle")}
                                                                className="bg-transparent border-none p-0 h-auto font-semibold text-white placeholder:text-slate-600 focus:ring-0"
                                                            />
                                                            <textarea
                                                                value={feat.description || ""}
                                                                onChange={e => {
                                                                    const newFeat = [...(editData.features || [])];
                                                                    newFeat[idx].description = e.target.value;
                                                                    setEditData(prev => ({ ...prev, features: newFeat }));
                                                                }}
                                                                placeholder={t("placeholders.featureDescription")}
                                                                className="w-full bg-transparent border-none p-0 text-sm text-slate-400 placeholder:text-slate-600 focus:ring-0 resize-none h-16"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const newFeat = (editData.features || []).filter((_, i) => i !== idx);
                                                            setEditData(prev => ({ ...prev, features: newFeat }));
                                                        }}
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all h-8 w-8"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LINKS TAB */}
                            {activeTab === "links" && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
                                        <h3 className="text-lg font-semibold text-white mb-6">{t("sections.links.title")}</h3>
                                        <div className="space-y-4 max-w-2xl">
                                            {[
                                                { type: "website", icon: <Globe className="h-4 w-4" />, label: t("links.website") },
                                                { type: "download", icon: <Download className="h-4 w-4" />, label: t("links.download") },
                                                { type: "github", icon: <div className="h-4 w-4 i-simple-icons-github" />, label: t("links.github") },
                                                { type: "discord", icon: <div className="h-4 w-4 i-simple-icons-discord" />, label: t("links.discord") },
                                            ].map((linkDef) => {
                                                const currentLink = editData.links?.find(l => l.type === linkDef.type);
                                                return (
                                                    <div key={linkDef.type} className="flex items-center gap-4">
                                                        <div className="w-32 text-sm text-slate-400 flex items-center gap-2">
                                                            {linkDef.icon}
                                                            {linkDef.label}
                                                        </div>
                                                        <Input
                                                            value={currentLink?.url || ""}
                                                            onChange={e => {
                                                                const links = [...(editData.links || [])];
                                                                const idx = links.findIndex(l => l.type === linkDef.type);
                                                                if (idx >= 0) {
                                                                    if (!e.target.value) links.splice(idx, 1);
                                                                    else links[idx].url = e.target.value;
                                                                } else if (e.target.value) {
                                                                    links.push({ type: linkDef.type, url: e.target.value } as ProjectLink);
                                                                }
                                                                setEditData(prev => ({ ...prev, links }));
                                                            }}
                                                            placeholder={`https://...`}
                                                            className="bg-black/20 border-white/10"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Sticky Save Buttons - Centered at Bottom when Dirty */}

            <AnimatePresence>
                {isDirty && (

                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 p-2 pl-4 pr-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        <span className="text-sm text-slate-400 mr-2">{t("dirtyNotice")}</span>
                        <Button
                            variant="ghost"
                            onClick={() => window.location.reload()} // Simple revert by reload for now
                            className="rounded-full text-slate-300 hover:text-white"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isPending || !editData.name}
                            className="rounded-full bg-[color:var(--color-turkish-blue-500)] hover:bg-[color:var(--color-turkish-blue-600)] text-white shadow-[0_0_20px_rgba(0,167,197,0.3)] min-w-[140px]"
                        >
                            {isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t("actions.save")}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
                <DialogContent className="sm:max-w-[425px] bg-[#0a0f18] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{t("dialogs.delete.title")}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {t("dialogs.delete.description")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(false)} className="border-white/10 text-white hover:bg-white/5 hover:text-white">
                            {t("cancel")}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50">
                            {t("actions.delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
