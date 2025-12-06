"use client";

import { Button } from "@/components/ui/button";
import type { Project, ProjectPlatform, ProjectScreenshot, ProjectFeature } from "@/types/project";
import {
    ArrowLeft,
    Save,
    Trash2,
    Plus,
    Eye,
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
    FileText,
    Settings,
    LayoutGrid,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useTransition, useCallback } from "react";
import { editProject as ep, deleteProject as dp, uploadImage, createProject as cpApi } from "@/lib/db";
import { toast } from "@/lib/react-toastify";
import Dropzone from "@/components/ui/dropzone";
import { routing } from "@/i18n/routing";
import { useAdminToken } from "@/hooks/use-admin-token";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Platform icons
const platformIcons: Record<string, React.ReactNode> = {
    windows: <Monitor className="h-4 w-4" />,
    macos: <Apple className="h-4 w-4" />,
    linux: <Monitor className="h-4 w-4" />,
    ios: <Smartphone className="h-4 w-4" />,
    android: <Play className="h-4 w-4" />,
    web: <Globe className="h-4 w-4" />,
};

const platformLabels: Record<string, string> = {
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    ios: "iOS",
    android: "Android",
    web: "Web",
};

const allPlatforms: ProjectPlatform[] = ["windows", "macos", "linux", "ios", "android", "web"];
const allCategories = ["game", "productivity", "entertainment", "education", "utility", "social", "other"];

const statusOptions = [
    { value: "draft", label: "Taslak", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
    { value: "in_progress", label: "Geliştiriliyor", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    { value: "on_hold", label: "Beklemede", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    { value: "completed", label: "Tamamlandı", color: "bg-green-500/20 text-green-300 border-green-500/30" },
    { value: "archived", label: "Arşivlendi", color: "bg-red-500/20 text-red-300 border-red-500/30" },
];

const typeOptions = [
    { value: "game", label: "Oyun" },
    { value: "website", label: "Web Sitesi" },
    { value: "tool", label: "Araç" },
    { value: "app", label: "Uygulama" },
    { value: "library", label: "Kütüphane" },
    { value: "other", label: "Diğer" },
];

type Props = {
    project: Project | null;
    isNew: boolean;
};

type EditableProject = Partial<Project> & {
    descriptionsByLocale?: Record<string, string>;
};

type TabId = "basic" | "media" | "features" | "links" | "settings";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "basic", label: "Temel Bilgiler", icon: <FileText className="h-4 w-4" /> },
    { id: "media", label: "Medya", icon: <ImageIcon className="h-4 w-4" /> },
    { id: "features", label: "Özellikler", icon: <Sparkles className="h-4 w-4" /> },
    { id: "links", label: "Bağlantılar", icon: <LinkIcon className="h-4 w-4" /> },
    { id: "settings", label: "Ayarlar", icon: <Settings className="h-4 w-4" /> },
];

export default function ProjectEditForm({ project, isNew }: Props) {
    const router = useRouter();
    const locales = routing.locales;
    const { token } = useAdminToken();

    const parseDescription = useCallback((description?: string | null): Record<string, string> => {
        if (!description) return {};
        try {
            const parsed = JSON.parse(description);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                const result: Record<string, string> = {};
                for (const loc of locales) {
                    if (typeof parsed[loc] === "string") {
                        result[loc] = parsed[loc];
                    }
                }
                return result;
            }
            return { [locales[0]]: description };
        } catch {
            return { [locales[0]]: description };
        }
    }, [locales]);

    const [editData, setEditData] = useState<EditableProject>(() => {
        if (isNew) {
            return {
                name: "",
                status: "draft",
                type: "other",
                platforms: [],
                categories: [],
                screenshots: [],
                features: [],
                links: [],
                descriptionsByLocale: {},
            };
        }
        return {
            ...project,
            descriptionsByLocale: parseDescription(project?.description),
        };
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(project?.logoUrl ?? null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<TabId>("basic");
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const handleImageUpload = async (file: File): Promise<string | null> => {
        if (!token) {
            toast.error("Yetkilendirme hatası");
            return null;
        }
        setLogoUploading(true);
        try {
            // Convert file to data URL
            const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ""));
                reader.readAsDataURL(file);
            });
            const result = await uploadImage(dataUrl, token);
            return result?.url || result?.dataUrl || null;
        } catch {
            toast.error("Resim yüklenemedi");
            return null;
        } finally {
            setLogoUploading(false);
        }
    };

    const handleSave = async () => {
        if (!token) {
            toast.error("Yetkilendirme hatası");
            return;
        }

        // Build description JSON
        const cleanedDescriptions: Record<string, string> = {};
        if (editData.descriptionsByLocale) {
            Object.entries(editData.descriptionsByLocale).forEach(([loc, value]) => {
                if (value && value.trim()) {
                    cleanedDescriptions[loc] = value;
                }
            });
        }

        const payload = {
            name: editData.name || "",
            description: Object.keys(cleanedDescriptions).length > 0 ? JSON.stringify(cleanedDescriptions) : "",
            status: editData.status,
            type: editData.type,
            logoUrl: logoPreview || editData.logoUrl || undefined,
            tagline: editData.tagline,
            version: editData.version,
            links: editData.links,
            platforms: editData.platforms,
            categories: editData.categories,
            screenshots: editData.screenshots,
            features: editData.features,
        };

        startTransition(async () => {
            try {
                if (isNew) {
                    const created = await cpApi(payload, token);
                    if (created?.id) {
                        toast.success("Proje oluşturuldu");
                        router.push(`/admin/dashboard/projects/${created.id}`);
                    } else {
                        toast.error("Proje oluşturulamadı");
                    }
                } else {
                    const updated = await ep(payload, project?.id as string, token);
                    if (updated) {
                        toast.success("Proje güncellendi");
                        router.refresh();
                    } else {
                        toast.error("Proje güncellenemedi");
                    }
                }
            } catch {
                toast.error("Bir hata oluştu");
            }
        });
    };

    const handleDelete = async () => {
        if (!token || !project?.id) return;

        startTransition(async () => {
            try {
                const success = await dp(project.id as string, token);
                if (success) {
                    toast.success("Proje silindi");
                    router.push("/admin/dashboard/projects");
                } else {
                    toast.error("Proje silinemedi");
                }
            } catch {
                toast.error("Bir hata oluştu");
            }
        });
    };

    // Screenshot functions
    const addScreenshot = () => {
        const newScreenshot: ProjectScreenshot = {
            url: "",
            caption: "",
            order: (editData.screenshots?.length || 0) + 1,
        };
        setEditData((prev) => ({
            ...prev,
            screenshots: [...(prev.screenshots || []), newScreenshot],
        }));
    };

    const updateScreenshot = (index: number, field: keyof ProjectScreenshot, value: string | number) => {
        setEditData((prev) => {
            const screenshots = [...(prev.screenshots || [])];
            screenshots[index] = { ...screenshots[index], [field]: value };
            return { ...prev, screenshots };
        });
    };

    const removeScreenshot = (index: number) => {
        setEditData((prev) => ({
            ...prev,
            screenshots: (prev.screenshots || []).filter((_, i) => i !== index),
        }));
    };

    // Feature functions
    const addFeature = () => {
        const newFeature: ProjectFeature = {
            title: "",
            description: "",
            icon: "",
            order: (editData.features?.length || 0) + 1,
        };
        setEditData((prev) => ({
            ...prev,
            features: [...(prev.features || []), newFeature],
        }));
    };

    const updateFeature = (index: number, field: keyof ProjectFeature, value: string) => {
        setEditData((prev) => {
            const features = [...(prev.features || [])];
            features[index] = { ...features[index], [field]: value };
            return { ...prev, features };
        });
    };

    const removeFeature = (index: number) => {
        setEditData((prev) => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== index),
        }));
    };

    // Platform toggle
    const togglePlatform = (platform: ProjectPlatform) => {
        setEditData((prev) => {
            const platforms = prev.platforms || [];
            if (platforms.includes(platform)) {
                return { ...prev, platforms: platforms.filter((p) => p !== platform) };
            }
            return { ...prev, platforms: [...platforms, platform] };
        });
    };

    // Category toggle
    const toggleCategory = (category: string) => {
        setEditData((prev) => {
            const categories = prev.categories || [];
            if (categories.includes(category)) {
                return { ...prev, categories: categories.filter((c) => c !== category) };
            }
            return { ...prev, categories: [...categories, category] };
        });
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(4,15,20,0.85)] border-b border-[rgba(110,211,225,0.1)]">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/dashboard/projects"
                                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition"
                            >
                                <ArrowLeft className="h-5 w-5 text-[rgba(255,255,255,0.6)]" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-semibold text-white">
                                    {isNew ? "Yeni Proje" : editData.name || "Proje Düzenle"}
                                </h1>
                                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                                    {isNew ? "Yeni bir proje oluşturun" : `ID: ${project?.id}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isNew && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setDeleteConfirm(true)}
                                    className="text-red-400 hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Sil
                                </Button>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={isPending || !editData.name}
                                className="bg-gradient-to-r from-[color:var(--color-turkish-blue-500)] to-[color:var(--color-turkish-blue-600)] hover:opacity-90"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isPending ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 mt-4 -mb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${activeTab === tab.id
                                    ? "bg-[rgba(0,167,197,0.15)] text-[color:var(--color-turkish-blue-300)] border-b-2 border-[color:var(--color-turkish-blue-400)]"
                                    : "text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.03)]"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Basic Tab */}
                        {activeTab === "basic" && (
                            <motion.div
                                key="basic"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {/* Name & Logo */}
                                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-[color:var(--color-turkish-blue-400)]" />
                                        Proje Bilgileri
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                                        {/* Logo */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Logo</label>
                                            <div className="relative aspect-square rounded-2xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(3,12,18,0.6)] overflow-hidden group">
                                                {logoPreview ? (
                                                    <>
                                                        <Image
                                                            src={logoPreview}
                                                            alt="Logo"
                                                            className="w-full h-full object-contain p-4"
                                                        />
                                                        <button
                                                            onClick={() => setLogoPreview(null)}
                                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Dropzone
                                                        accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                                                        onDrop={async (files) => {
                                                            const url = await handleImageUpload(files[0]);
                                                            if (url) setLogoPreview(url);
                                                        }}
                                                    >
                                                        <div className="flex flex-col items-center justify-center h-full gap-2 text-[rgba(255,255,255,0.4)] p-4">
                                                            <ImageIcon className="h-10 w-10" />
                                                            <span className="text-xs text-center">Logo yükle</span>
                                                        </div>
                                                    </Dropzone>
                                                )}
                                                {logoUploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Name, Tagline, Status, Type */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Proje Adı *</label>
                                                <Input
                                                    value={editData.name || ""}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    placeholder="Proje adı"
                                                    className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Tagline</label>
                                                <Input
                                                    value={editData.tagline || ""}
                                                    onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                                                    placeholder="Kısa açıklama (ör: Geleceği inşa et)"
                                                    className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Durum</label>
                                                    <select
                                                        value={editData.status || "draft"}
                                                        onChange={(e) => setEditData({ ...editData, status: e.target.value as Project["status"] })}
                                                        className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] px-3 py-2 text-sm text-white"
                                                    >
                                                        {statusOptions.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Tür</label>
                                                    <select
                                                        value={editData.type || "other"}
                                                        onChange={(e) => setEditData({ ...editData, type: e.target.value as Project["type"] })}
                                                        className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] px-3 py-2 text-sm text-white"
                                                    >
                                                        {typeOptions.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Versiyon</label>
                                                    <Input
                                                        value={editData.version || ""}
                                                        onChange={(e) => setEditData({ ...editData, version: e.target.value })}
                                                        placeholder="1.0.0"
                                                        className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Descriptions */}
                                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-[color:var(--color-turkish-blue-400)]" />
                                        Açıklamalar
                                    </h3>
                                    <div className="space-y-4">
                                        {locales.map((locale) => (
                                            <div key={locale} className="space-y-2">
                                                <label className="text-sm font-medium text-[rgba(255,255,255,0.8)] flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded bg-[rgba(0,167,197,0.2)] text-xs uppercase">{locale}</span>
                                                    Açıklama
                                                </label>
                                                <textarea
                                                    value={editData.descriptionsByLocale?.[locale] || ""}
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            descriptionsByLocale: {
                                                                ...prev.descriptionsByLocale,
                                                                [locale]: e.target.value,
                                                            },
                                                        }))
                                                    }
                                                    placeholder={`${locale.toUpperCase()} açıklama...`}
                                                    className="w-full min-h-[120px] rounded-lg border border-[rgba(0,167,197,0.2)] bg-[rgba(3,12,18,0.6)] p-4 text-sm text-white focus:border-[rgba(0,167,197,0.5)] focus:outline-none resize-y"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Platforms */}
                                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <LayoutGrid className="h-5 w-5 text-[color:var(--color-turkish-blue-400)]" />
                                        Platformlar
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {allPlatforms.map((platform) => (
                                            <button
                                                key={platform}
                                                type="button"
                                                onClick={() => togglePlatform(platform)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${editData.platforms?.includes(platform)
                                                    ? "border-[color:var(--color-turkish-blue-400)] bg-[rgba(0,167,197,0.15)] text-[color:var(--color-turkish-blue-300)]"
                                                    : "border-[rgba(110,211,225,0.15)] bg-[rgba(3,12,18,0.6)] text-[rgba(255,255,255,0.5)] hover:border-[rgba(110,211,225,0.3)]"
                                                    }`}
                                            >
                                                {platformIcons[platform]}
                                                <span>{platformLabels[platform]}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                                    <h3 className="text-lg font-semibold text-white mb-4">Kategoriler</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {allCategories.map((category) => (
                                            <button
                                                key={category}
                                                type="button"
                                                onClick={() => toggleCategory(category)}
                                                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${editData.categories?.includes(category)
                                                    ? "bg-[rgba(0,167,197,0.2)] text-[color:var(--color-turkish-blue-300)] border border-[color:var(--color-turkish-blue-400)]"
                                                    : "bg-[rgba(3,12,18,0.6)] text-[rgba(255,255,255,0.5)] border border-[rgba(110,211,225,0.15)] hover:border-[rgba(110,211,225,0.3)]"
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Media Tab */}
                        {activeTab === "media" && (
                            <motion.div
                                key="media"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5 text-[color:var(--color-turkish-blue-400)]" />
                                            Ekran Görüntüleri
                                        </h3>
                                        <Button variant="outline" size="sm" onClick={addScreenshot}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Ekle
                                        </Button>
                                    </div>

                                    <Reorder.Group
                                        axis="y"
                                        values={editData.screenshots || []}
                                        onReorder={(newOrder) => setEditData({ ...editData, screenshots: newOrder })}
                                        className="space-y-3"
                                    >
                                        {(editData.screenshots || []).map((screenshot, index) => (
                                            <Reorder.Item
                                                key={screenshot.url || index}
                                                value={screenshot}
                                                className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(110,211,225,0.1)] bg-[rgba(4,16,22,0.5)]"
                                            >
                                                <GripVertical className="h-5 w-5 text-[rgba(255,255,255,0.3)] cursor-grab" />
                                                <div className="w-20 h-14 rounded-lg overflow-hidden bg-[rgba(3,12,18,0.6)] flex-shrink-0 relative">
                                                    {screenshot.url ? (
                                                        <Image
                                                            src={screenshot.url}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                            sizes="80px"
                                                            unoptimized={!screenshot.url.startsWith('https://cdn.tengra.studio')}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="h-5 w-5 text-[rgba(255,255,255,0.2)]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <Input
                                                        value={screenshot.url || ""}
                                                        onChange={(e) => updateScreenshot(index, "url", e.target.value)}
                                                        placeholder="Resim URL'si"
                                                        className="text-sm border-[rgba(0,167,197,0.2)] bg-[rgba(3,12,18,0.6)] text-white"
                                                    />
                                                    <Input
                                                        value={screenshot.caption || ""}
                                                        onChange={(e) => updateScreenshot(index, "caption", e.target.value)}
                                                        placeholder="Açıklama"
                                                        className="text-sm border-[rgba(0,167,197,0.2)] bg-[rgba(3,12,18,0.6)] text-white"
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeScreenshot(index)}
                                                    className="text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>

                                    {(!editData.screenshots || editData.screenshots.length === 0) && (
                                        <div className="text-center py-12 text-[rgba(255,255,255,0.4)]">
                                            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>Henüz ekran görüntüsü eklenmedi</p>
                                            <Button variant="outline" size="sm" onClick={addScreenshot} className="mt-4">
                                                <Plus className="h-4 w-4 mr-1" />
                                                İlk Görüntüyü Ekle
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Features Tab */}
                        {activeTab === "features" && (
                            <motion.div
                                key="features"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-[color:var(--color-turkish-blue-400)]" />
                                            Özellikler
                                        </h3>
                                        <Button variant="outline" size="sm" onClick={addFeature}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Ekle
                                        </Button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {(editData.features || []).map((feature, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-xl border border-[rgba(110,211,225,0.1)] bg-[rgba(4,16,22,0.5)] space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-[rgba(255,255,255,0.4)]">Özellik #{index + 1}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFeature(index)}
                                                        className="text-red-400 hover:bg-red-500/10 h-7 w-7 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-[60px_1fr] gap-2">
                                                    <Input
                                                        value={feature.icon || ""}
                                                        onChange={(e) => updateFeature(index, "icon", e.target.value)}
                                                        placeholder="🚀"
                                                        className="text-center text-lg border-[rgba(0,167,197,0.2)] bg-[rgba(3,12,18,0.6)] text-white"
                                                    />
                                                    <Input
                                                        value={feature.title}
                                                        onChange={(e) => updateFeature(index, "title", e.target.value)}
                                                        placeholder="Özellik başlığı"
                                                        className="border-[rgba(0,167,197,0.2)] bg-[rgba(3,12,18,0.6)] text-white"
                                                    />
                                                </div>
                                                <textarea
                                                    value={feature.description || ""}
                                                    onChange={(e) => updateFeature(index, "description", e.target.value)}
                                                    placeholder="Özellik açıklaması..."
                                                    className="w-full min-h-[60px] rounded-lg border border-[rgba(0,167,197,0.2)] bg-[rgba(3,12,18,0.6)] p-3 text-sm text-white focus:border-[rgba(0,167,197,0.5)] focus:outline-none resize-none"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {(!editData.features || editData.features.length === 0) && (
                                        <div className="text-center py-12 text-[rgba(255,255,255,0.4)]">
                                            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>Henüz özellik eklenmedi</p>
                                            <Button variant="outline" size="sm" onClick={addFeature} className="mt-4">
                                                <Plus className="h-4 w-4 mr-1" />
                                                İlk Özelliği Ekle
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Links Tab */}
                        {activeTab === "links" && (
                            <motion.div
                                key="links"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-[color:var(--color-turkish-blue-400)]" />
                                        Bağlantılar
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Download Link */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[rgba(255,255,255,0.8)] flex items-center gap-2">
                                                <Download className="h-4 w-4" />
                                                İndirme Bağlantısı
                                            </label>
                                            <Input
                                                value={editData.links?.find(l => l.type === 'download')?.url || ""}
                                                onChange={(e) => {
                                                    const links = [...(editData.links || [])];
                                                    const idx = links.findIndex(l => l.type === 'download');
                                                    if (idx >= 0) {
                                                        links[idx] = { ...links[idx], url: e.target.value };
                                                    } else if (e.target.value) {
                                                        links.push({ type: 'download', url: e.target.value, label: 'İndir' });
                                                    }
                                                    setEditData({ ...editData, links });
                                                }}
                                                placeholder="https://..."
                                                className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                                            />
                                        </div>

                                        {/* Website Link */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[rgba(255,255,255,0.8)] flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                Web Sitesi
                                            </label>
                                            <Input
                                                value={editData.links?.find(l => l.type === 'website')?.url || ""}
                                                onChange={(e) => {
                                                    const links = [...(editData.links || [])];
                                                    const idx = links.findIndex(l => l.type === 'website');
                                                    if (idx >= 0) {
                                                        links[idx] = { ...links[idx], url: e.target.value };
                                                    } else if (e.target.value) {
                                                        links.push({ type: 'website', url: e.target.value, label: 'Web Sitesi' });
                                                    }
                                                    setEditData({ ...editData, links });
                                                }}
                                                placeholder="https://..."
                                                className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                                            />
                                        </div>

                                        {/* GitHub Link */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[rgba(255,255,255,0.8)]">GitHub</label>
                                            <Input
                                                value={editData.links?.find(l => l.type === 'github')?.url || ""}
                                                onChange={(e) => {
                                                    const links = [...(editData.links || [])];
                                                    const idx = links.findIndex(l => l.type === 'github');
                                                    if (idx >= 0) {
                                                        links[idx] = { ...links[idx], url: e.target.value };
                                                    } else if (e.target.value) {
                                                        links.push({ type: 'github', url: e.target.value, label: 'GitHub' });
                                                    }
                                                    setEditData({ ...editData, links });
                                                }}
                                                placeholder="https://github.com/..."
                                                className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.8)] text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {/* Stats (Read-only) */}
                                {!isNew && (
                                    <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                                        <h3 className="text-lg font-semibold text-white mb-4">İstatistikler</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 rounded-xl bg-[rgba(4,16,22,0.5)] text-center">
                                                <Download className="h-5 w-5 mx-auto mb-2 text-[color:var(--color-turkish-blue-400)]" />
                                                <p className="text-2xl font-bold text-white">{project?.downloadCount || 0}</p>
                                                <p className="text-xs text-[rgba(255,255,255,0.5)]">İndirme</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-[rgba(4,16,22,0.5)] text-center">
                                                <Eye className="h-5 w-5 mx-auto mb-2 text-[color:var(--color-turkish-blue-400)]" />
                                                <p className="text-2xl font-bold text-white">{project?.viewCount || 0}</p>
                                                <p className="text-xs text-[rgba(255,255,255,0.5)]">Görüntülenme</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Danger Zone */}
                                {!isNew && (
                                    <div className="rounded-2xl border border-red-500/30 bg-[rgba(127,29,29,0.1)] p-6">
                                        <h3 className="text-lg font-semibold text-red-400 mb-2">Tehlikeli Bölge</h3>
                                        <p className="text-sm text-[rgba(255,255,255,0.5)] mb-4">
                                            Bu proje kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                                        </p>
                                        <Button
                                            variant="destructive"
                                            onClick={() => setDeleteConfirm(true)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Projeyi Sil
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[rgba(15,31,54,0.95)] p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-2">Projeyi Sil</h3>
                        <p className="text-sm text-[rgba(255,255,255,0.6)] mb-6">
                            <strong>{editData.name}</strong> projesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setDeleteConfirm(false)}>
                                İptal
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                                {isPending ? "Siliniyor..." : "Sil"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
