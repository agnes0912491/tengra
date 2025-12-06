"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteShell from "@/components/layout/site-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
    ChevronRight,
    Plus,
    MessageSquare,
    Eye,
    Pin,
    Lock,
    Flame,
    Clock,
    ArrowLeft,

    Megaphone,
    Gamepad2,
    Code,
    Palette,
    HelpCircle,
    Lightbulb,
    Bug,
} from "lucide-react";

// Category info mapping
const categoryInfo: Record<string, { name: string; description: string; icon: React.ReactNode; color: string }> = {
    "duyurular": {
        name: "Duyurular",
        description: "Tengra Studio'dan resmi duyurular ve güncellemeler",
        icon: <Megaphone className="w-8 h-8" />,
        color: "from-amber-500 to-orange-600",
    },
    "genel-tartisma": {
        name: "Genel Tartışma",
        description: "Her konuda serbest tartışma alanı",
        icon: <MessageSquare className="w-8 h-8" />,
        color: "from-blue-500 to-cyan-600",
    },
    "oyunlar": {
        name: "Oyunlar",
        description: "Tengra oyunları hakkında tartışmalar, stratejiler ve ipuçları",
        icon: <Gamepad2 className="w-8 h-8" />,
        color: "from-purple-500 to-pink-600",
    },
    "gelistirici": {
        name: "Geliştirici Köşesi",
        description: "API, SDK ve entegrasyonlar hakkında teknik tartışmalar",
        icon: <Code className="w-8 h-8" />,
        color: "from-emerald-500 to-teal-600",
    },
    "tasarim": {
        name: "Tasarım & Sanat",
        description: "Görsel tasarım, UI/UX ve sanat eserleri paylaşımı",
        icon: <Palette className="w-8 h-8" />,
        color: "from-rose-500 to-red-600",
    },
    "oneriler": {
        name: "Öneriler & Fikirler",
        description: "Yeni özellik önerileri ve geri bildirimler",
        icon: <Lightbulb className="w-8 h-8" />,
        color: "from-yellow-500 to-amber-600",
    },
    "destek": {
        name: "Destek & Yardım",
        description: "Sorularınızı sorun, topluluktan yardım alın",
        icon: <HelpCircle className="w-8 h-8" />,
        color: "from-sky-500 to-blue-600",
    },
    "bug-raporlari": {
        name: "Bug Raporları",
        description: "Hata ve bug raporları",
        icon: <Bug className="w-8 h-8" />,
        color: "from-red-500 to-rose-600",
    },
};

// Mock topics for category
const mockTopics = [
    {
        id: "1",
        title: "Önemli: Topluluk Kuralları ve Forum Kullanım Rehberi",
        author: { name: "Agnes", role: "admin" },
        replies: 0,
        views: 5678,
        createdAt: "1 ay önce",
        lastReply: { author: "Agnes", date: "1 ay önce" },
        isPinned: true,
        isLocked: true,
    },
    {
        id: "2",
        title: "v2.0 Beta Test Programı - Başvurular Açık!",
        author: { name: "Agnes", role: "admin" },
        replies: 156,
        views: 4523,
        createdAt: "3 gün önce",
        lastReply: { author: "BetaTester", date: "2 saat önce" },
        isPinned: true,
        isHot: true,
    },
    {
        id: "3",
        title: "Yeni özellik: Karanlık mod tercihleri artık kaydediliyor",
        author: { name: "DevTeam", role: "moderator" },
        replies: 45,
        views: 1234,
        createdAt: "1 hafta önce",
        lastReply: { author: "NightOwl", date: "5 saat önce" },
        isHot: true,
    },
    {
        id: "4",
        title: "Haftalık geliştirici günlüğü #42",
        author: { name: "Agnes", role: "admin" },
        replies: 23,
        views: 789,
        createdAt: "2 gün önce",
        lastReply: { author: "CuriousDev", date: "1 gün önce" },
    },
    {
        id: "5",
        title: "API değişiklikleri hakkında bilgilendirme",
        author: { name: "DevTeam", role: "moderator" },
        replies: 67,
        views: 2341,
        createdAt: "5 gün önce",
        lastReply: { author: "APIUser", date: "12 saat önce" },
    },
    {
        id: "6",
        title: "Mobil uygulama ne zaman geliyor?",
        author: { name: "MobileUser", role: "member" },
        replies: 89,
        views: 3456,
        createdAt: "1 hafta önce",
        lastReply: { author: "Agnes", date: "3 gün önce" },
        isHot: true,
    },
    {
        id: "7",
        title: "Topluluk etkinliği: Aylık çekiliş başladı!",
        author: { name: "EventOrg", role: "moderator" },
        replies: 234,
        views: 5678,
        createdAt: "4 gün önce",
        lastReply: { author: "LuckyWinner", date: "30 dakika önce" },
        isHot: true,
    },
    {
        id: "8",
        title: "Profil özelleştirme önerileri",
        author: { name: "Designer", role: "member" },
        replies: 12,
        views: 345,
        createdAt: "2 hafta önce",
        lastReply: { author: "UXFan", date: "1 hafta önce" },
    },
];

type SortOption = "latest" | "popular" | "replies" | "oldest";

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { isAuthenticated } = useAuth();

    const [sortBy, setSortBy] = useState<SortOption>("latest");
    // Filters functionality can be added later

    const category = categoryInfo[slug];

    if (!category) {
        return (
            <SiteShell>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Kategori Bulunamadı</h1>
                        <p className="text-[var(--text-muted)] mb-4">Bu kategori mevcut değil veya kaldırılmış olabilir.</p>
                        <Link href="/forum">
                            <Button variant="primary">Foruma Dön</Button>
                        </Link>
                    </div>
                </div>
            </SiteShell>
        );
    }

    // Sort topics
    const sortedTopics = [...mockTopics].sort((a, b) => {
        // Pinned always first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        switch (sortBy) {
            case "popular":
                return b.views - a.views;
            case "replies":
                return b.replies - a.replies;
            case "oldest":
                return 0; // Would use actual dates
            default:
                return 0; // Latest - would use actual dates
        }
    });

    return (
        <SiteShell>
            <div className="min-h-screen px-4 py-8 md:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6"
                    >
                        <Link href="/forum" className="hover:text-[var(--color-turkish-blue-400)] transition-colors">
                            Forum
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-[var(--text-secondary)]">{category.name}</span>
                    </motion.div>

                    {/* Category Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-6 md:p-8 mb-8 overflow-hidden"
                    >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5`} />

                        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                            {/* Icon */}
                            <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg`}>
                                {category.icon}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
                                    {category.name}
                                </h1>
                                <p className="text-[var(--text-secondary)]">{category.description}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-muted)]">
                                    <span>{mockTopics.length} konu</span>
                                    <span>•</span>
                                    <span>{mockTopics.reduce((acc, t) => acc + t.replies, 0)} gönderi</span>
                                </div>
                            </div>

                            {/* New Topic Button */}
                            <div className="shrink-0">
                                <Link href={isAuthenticated ? `/forum/new?category=${slug}` : `/login?next=/forum/new?category=${slug}`}>
                                    <Button variant="primary" size="lg">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Yeni Konu
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filters & Sort */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
                    >
                        {/* Back Link */}
                        <Link href="/forum" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Tüm Kategoriler
                        </Link>

                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--text-muted)]">Sırala:</span>
                            <div className="flex gap-1">
                                {[
                                    { id: "latest", label: "En Yeni", icon: <Clock className="w-4 h-4" /> },
                                    { id: "popular", label: "Popüler", icon: <Eye className="w-4 h-4" /> },
                                    { id: "replies", label: "En Çok Yanıt", icon: <MessageSquare className="w-4 h-4" /> },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSortBy(option.id as SortOption)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === option.id
                                                ? "bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)] border border-[rgba(72,213,255,0.3)]"
                                                : "text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                                            }`}
                                    >
                                        {option.icon}
                                        <span className="hidden sm:inline">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Topics List */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] overflow-hidden"
                    >
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[rgba(0,0,0,0.2)] text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                            <div className="col-span-6">Konu</div>
                            <div className="col-span-2 text-center">Yanıt</div>
                            <div className="col-span-2 text-center">Görüntülenme</div>
                            <div className="col-span-2 text-right">Son Aktivite</div>
                        </div>

                        {/* Topics */}
                        <div className="divide-y divide-[rgba(72,213,255,0.05)]">
                            {sortedTopics.map((topic, index) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Link href={`/forum/t/${topic.id}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-[rgba(30,184,255,0.05)] transition-colors">
                                            {/* Topic Info */}
                                            <div className="md:col-span-6">
                                                <div className="flex items-start gap-3">
                                                    {/* Author Avatar */}
                                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${topic.author.role === "admin"
                                                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                            : topic.author.role === "moderator"
                                                                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                                                : "bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)]"
                                                        }`}>
                                                        {topic.author.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            {topic.isPinned && (
                                                                <Pin className="w-3.5 h-3.5 text-amber-400" />
                                                            )}
                                                            {topic.isLocked && (
                                                                <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                            )}
                                                            {topic.isHot && (
                                                                <Flame className="w-3.5 h-3.5 text-orange-400" />
                                                            )}
                                                            <h4 className="font-medium text-[var(--text-primary)] hover:text-[var(--color-turkish-blue-300)] transition-colors line-clamp-1">
                                                                {topic.title}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                            <span className={`${topic.author.role === "admin"
                                                                    ? "text-amber-400"
                                                                    : topic.author.role === "moderator"
                                                                        ? "text-emerald-400"
                                                                        : ""
                                                                }`}>
                                                                {topic.author.name}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{topic.createdAt}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats - Desktop */}
                                            <div className="hidden md:flex md:col-span-2 items-center justify-center">
                                                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                                                    <MessageSquare className="w-4 h-4" />
                                                    {topic.replies}
                                                </div>
                                            </div>
                                            <div className="hidden md:flex md:col-span-2 items-center justify-center">
                                                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                                                    <Eye className="w-4 h-4" />
                                                    {topic.views.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="hidden md:flex md:col-span-2 items-center justify-end text-right">
                                                <div className="text-xs">
                                                    <p className="text-[var(--text-secondary)]">{topic.lastReply.author}</p>
                                                    <p className="text-[var(--text-muted)]">{topic.lastReply.date}</p>
                                                </div>
                                            </div>

                                            {/* Stats - Mobile */}
                                            <div className="md:hidden flex items-center gap-4 text-xs text-[var(--text-muted)] pl-13">
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" /> {topic.replies}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> {topic.views.toLocaleString()}
                                                </span>
                                                <span>{topic.lastReply.date}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-[rgba(72,213,255,0.05)]">
                            <button className="px-3 py-1.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all disabled:opacity-50" disabled>
                                Önceki
                            </button>
                            <div className="flex gap-1">
                                {[1, 2, 3].map((page) => (
                                    <button
                                        key={page}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === 1
                                                ? "bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)] border border-[rgba(72,213,255,0.3)]"
                                                : "text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all">
                                Sonraki
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </SiteShell>
    );
}
