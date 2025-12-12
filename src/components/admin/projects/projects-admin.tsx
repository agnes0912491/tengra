"use client";

import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";
import {
    Edit,
    Trash2,
    Plus,
    Search,
    Eye,
    Download,
    Star,
    Image as ImageIcon,
    Globe,
    Smartphone,
    Monitor,
    Apple,
    Play,
    Package,
    ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useTransition } from "react";
import { deleteProject as dp } from "@/lib/db";
import { toast } from "@/lib/react-toastify";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
} from "@/components/ui/dialog";
import { useAdminToken } from "@/hooks/use-admin-token";
import { motion, AnimatePresence } from "framer-motion";
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

const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const formatStatus = (status?: Project["status"]) => {
    switch (status) {
        case "draft": return "Taslak";
        case "in_progress": return "Geliştiriliyor";
        case "on_hold": return "Beklemede";
        case "completed": return "Tamamlandı";
        case "archived": return "Arşivlendi";
        default: return "Belirsiz";
    }
};

const statusColors: Record<string, string> = {
    draft: "border-gray-500/30 bg-gray-500/10 text-gray-300",
    in_progress: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    on_hold: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    completed: "border-green-500/30 bg-green-500/10 text-green-300",
    archived: "border-red-500/30 bg-red-500/10 text-red-300",
};

type Props = {
    projects: Project[];
};

export default function ProjectsAdmin({ projects }: Props) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [localProjects, setLocalProjects] = useState<Project[]>(projects);
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");

    const { token } = useAdminToken();

    useEffect(() => {
        setLocalProjects(projects);
    }, [projects]);

    // Stats
    const stats = {
        total: localProjects.length,
        completed: localProjects.filter((p) => p.status === "completed").length,
        inProgress: localProjects.filter((p) => p.status === "in_progress").length,
        totalDownloads: localProjects.reduce((acc, p) => acc + (p.downloadCount || 0), 0),
        totalViews: localProjects.reduce((acc, p) => acc + (p.viewCount || 0), 0),
    };

    // Filter projects
    const filteredProjects = localProjects.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.tagline?.toLowerCase().includes(q)
        );
    });

    const openDeleteModal = (project: Project) => {
        setCurrentProject(project);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!token || !currentProject?.id) {
            toast.error("Yetkilendirme belirteci eksik.");
            return;
        }

        startTransition(async () => {
            const success = await dp(currentProject.id as string, token);
            if (success) {
                setLocalProjects((prev) => prev.filter((p) => p.id !== currentProject.id));
                toast.success("Proje başarıyla silindi.");
            } else {
                toast.error("Proje silinemedi.");
            }
            setDeleteModalOpen(false);
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Projeler</h1>
                    <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">
                        Tüm projelerinizi yönetin
                    </p>
                </div>
                <Link href="/admin/dashboard/projects/new">
                    <Button className="bg-gradient-to-r from-[color:var(--color-turkish-blue-500)] to-[color:var(--color-turkish-blue-600)] hover:opacity-90">
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Proje
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-[rgba(255,255,255,0.5)] text-sm">
                        <Package className="h-4 w-4" />
                        Toplam
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <Package className="h-4 w-4" />
                        Tamamlanan
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{stats.completed}</p>
                </div>
                <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                        <Package className="h-4 w-4" />
                        Devam Eden
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{stats.inProgress}</p>
                </div>
                <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-[rgba(255,255,255,0.5)] text-sm">
                        <Download className="h-4 w-4" />
                        İndirme
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{stats.totalDownloads.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-[rgba(255,255,255,0.5)] text-sm">
                        <Eye className="h-4 w-4" />
                        Görüntülenme
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{stats.totalViews.toLocaleString()}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(255,255,255,0.4)]" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Proje ara..."
                    className="pl-10 border-[rgba(110,211,225,0.2)] bg-[rgba(3,12,18,0.6)] text-white"
                />
            </div>

            {/* Projects Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="group rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] backdrop-blur-xl overflow-hidden hover:border-[rgba(110,211,225,0.3)] transition-all"
                        >
                            {/* Card Header */}
                            <div className="relative h-24 bg-gradient-to-br from-[rgba(0,167,197,0.2)] to-[rgba(4,15,20,0.8)]">
                                {/* Logo */}
                                <div className="absolute -bottom-6 left-4">
                                    <div className="w-16 h-16 rounded-xl border-2 border-[rgba(4,15,20,0.9)] bg-[rgba(6,20,27,0.95)] shadow-lg overflow-hidden flex items-center justify-center">
                                        {project.logoUrl ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={project.logoUrl}
                                                    alt={project.name || ""}
                                                    fill
                                                    className="object-contain p-1"
                                                    sizes="64px"
                                                    unoptimized={!project.logoUrl.startsWith('https://cdn.tengra.studio')}
                                                />
                                            </div>
                                        ) : (
                                            <Package className="h-8 w-8 text-[rgba(255,255,255,0.3)]" />
                                        )}
                                    </div>
                                </div>
                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-medium border ${statusColors[project.status || "draft"]}`}>
                                        {formatStatus(project.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="pt-10 px-4 pb-4 space-y-3">
                                <div>
                                    <h3 className="font-semibold text-white text-lg line-clamp-1">{project.name}</h3>
                                    {project.tagline && (
                                        <p className="text-sm text-[rgba(255,255,255,0.5)] line-clamp-2 mt-1">{project.tagline}</p>
                                    )}
                                </div>

                                {/* Version & Type */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {project.version && (
                                        <span className="px-2 py-0.5 rounded bg-[rgba(0,167,197,0.15)] text-[10px] text-[color:var(--color-turkish-blue-300)]">
                                            v{project.version}
                                        </span>
                                    )}
                                    {project.type && (
                                        <span className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[10px] text-[rgba(255,255,255,0.5)] capitalize">
                                            {project.type}
                                        </span>
                                    )}
                                </div>

                                {/* Platforms */}
                                {project.platforms && project.platforms.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        {project.platforms.slice(0, 4).map((platform) => (
                                            <div
                                                key={platform}
                                                className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)]"
                                                title={platform}
                                            >
                                                {platformIcons[platform]}
                                            </div>
                                        ))}
                                        {project.platforms.length > 4 && (
                                            <span className="text-[10px] text-[rgba(255,255,255,0.4)]">
                                                +{project.platforms.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Stats Row */}
                                <div className="flex items-center gap-4 text-xs text-[rgba(255,255,255,0.5)]">
                                    {project.downloadCount !== undefined && (
                                        <span className="flex items-center gap-1">
                                            <Download className="h-3 w-3" />
                                            {project.downloadCount.toLocaleString()}
                                        </span>
                                    )}
                                    {project.viewCount !== undefined && (
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {project.viewCount.toLocaleString()}
                                        </span>
                                    )}
                                    {project.rating !== undefined && project.rating > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                            {project.rating.toFixed(1)}
                                        </span>
                                    )}
                                    {project.screenshots && project.screenshots.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <ImageIcon className="h-3 w-3" />
                                            {project.screenshots.length}
                                        </span>
                                    )}
                                </div>

                                {/* Update time */}
                                <p className="text-[10px] text-[rgba(255,255,255,0.35)]">
                                    {formatDateTime(project.lastUpdatedAt ?? project.createdAt ?? undefined)}
                                </p>
                            </div>

                            {/* Card Footer */}
                            <div className="px-4 py-3 border-t border-[rgba(110,211,225,0.08)] bg-[rgba(4,16,22,0.4)] flex items-center gap-2">
                                <Link href={`/admin/dashboard/projects/${project.id}`} className="flex-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-[color:var(--color-turkish-blue-300)] hover:bg-[rgba(0,167,197,0.1)]"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Düzenle
                                    </Button>
                                </Link>
                                {project.links?.find(l => l.type === 'website')?.url && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)]"
                                    >
                                        <a href={project.links.find(l => l.type === 'website')?.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteModal(project)}
                                    className="text-red-400 hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredProjects.length === 0 && (
                <div className="text-center py-16 text-[rgba(255,255,255,0.4)]">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Proje bulunamadı</p>
                    <Link href="/admin/dashboard/projects/new">
                        <Button variant="outline" size="sm" className="mt-4">
                            <Plus className="h-4 w-4 mr-1" />
                            Yeni Proje Oluştur
                        </Button>
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="max-w-md border border-red-500/30 bg-[rgba(15,31,54,0.95)] backdrop-blur-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-400" />
                            Projeyi Sil
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-[rgba(255,255,255,0.7)]">
                            <strong className="text-white">{currentProject?.name}</strong> projesini silmek istediğinizden emin misiniz?
                        </p>
                        <p className="text-sm text-red-400 mt-2">
                            Bu işlem geri alınamaz.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteModalOpen(false)}
                            className="text-[rgba(255,255,255,0.7)]"
                        >
                            İptal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? "Siliniyor..." : "Sil"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
