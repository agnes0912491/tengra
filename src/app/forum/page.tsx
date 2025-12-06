"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteShell from "@/components/layout/site-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
    MessageCircle,
    Users,
    Flame,
    Clock,
    ChevronRight,
    Plus,
    Search,
    TrendingUp,
    MessageSquare,
    Eye,
    Pin,
    Lock,
    Gamepad2,
    Code,
    Palette,
    HelpCircle,
    Megaphone,
    Lightbulb,
    Bug,
    Sparkles,
} from "lucide-react";

// Forum category type
interface ForumCategory {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    topicCount: number;
    postCount: number;
    lastPost?: {
        title: string;
        author: string;
        date: string;
    };
}

// Topic type
interface ForumTopic {
    id: string;
    title: string;
    category: string;
    categorySlug: string;
    author: {
        name: string;
        avatar?: string;
    };
    replies: number;
    views: number;
    lastReply: {
        author: string;
        date: string;
    };
    isPinned?: boolean;
    isLocked?: boolean;
    isHot?: boolean;
}

// Mock data for categories
const categories: ForumCategory[] = [
    {
        id: "1",
        slug: "duyurular",
        name: "Duyurular",
        description: "Tengra Studio'dan resmi duyurular ve güncellemeler",
        icon: <Megaphone className="w-6 h-6" />,
        color: "from-amber-500 to-orange-600",
        topicCount: 12,
        postCount: 156,
        lastPost: {
            title: "v2.0 Güncellemesi Yakında!",
            author: "Agnes",
            date: "2 saat önce",
        },
    },
    {
        id: "2",
        slug: "genel-tartisma",
        name: "Genel Tartışma",
        description: "Her konuda serbest tartışma alanı",
        icon: <MessageSquare className="w-6 h-6" />,
        color: "from-blue-500 to-cyan-600",
        topicCount: 89,
        postCount: 1247,
        lastPost: {
            title: "Topluluk buluşması ne zaman?",
            author: "Kullanıcı123",
            date: "15 dakika önce",
        },
    },
    {
        id: "3",
        slug: "oyunlar",
        name: "Oyunlar",
        description: "Tengra oyunları hakkında tartışmalar, stratejiler ve ipuçları",
        icon: <Gamepad2 className="w-6 h-6" />,
        color: "from-purple-500 to-pink-600",
        topicCount: 156,
        postCount: 2891,
        lastPost: {
            title: "En iyi başlangıç stratejisi",
            author: "ProGamer",
            date: "1 saat önce",
        },
    },
    {
        id: "4",
        slug: "gelistirici",
        name: "Geliştirici Köşesi",
        description: "API, SDK ve entegrasyonlar hakkında teknik tartışmalar",
        icon: <Code className="w-6 h-6" />,
        color: "from-emerald-500 to-teal-600",
        topicCount: 45,
        postCount: 678,
        lastPost: {
            title: "REST API rate limit sorusu",
            author: "DevMaster",
            date: "3 saat önce",
        },
    },
    {
        id: "5",
        slug: "tasarim",
        name: "Tasarım & Sanat",
        description: "Görsel tasarım, UI/UX ve sanat eserleri paylaşımı",
        icon: <Palette className="w-6 h-6" />,
        color: "from-rose-500 to-red-600",
        topicCount: 34,
        postCount: 412,
        lastPost: {
            title: "Fan art paylaşım thread'i",
            author: "Artisan",
            date: "5 saat önce",
        },
    },
    {
        id: "6",
        slug: "oneriler",
        name: "Öneriler & Fikirler",
        description: "Yeni özellik önerileri ve geri bildirimler",
        icon: <Lightbulb className="w-6 h-6" />,
        color: "from-yellow-500 to-amber-600",
        topicCount: 67,
        postCount: 534,
        lastPost: {
            title: "Mobil uygulama önerisi",
            author: "MobilUser",
            date: "30 dakika önce",
        },
    },
    {
        id: "7",
        slug: "destek",
        name: "Destek & Yardım",
        description: "Sorularınızı sorun, topluluktan yardım alın",
        icon: <HelpCircle className="w-6 h-6" />,
        color: "from-sky-500 to-blue-600",
        topicCount: 123,
        postCount: 1567,
        lastPost: {
            title: "Hesap doğrulama sorunu",
            author: "YeniUye",
            date: "45 dakika önce",
        },
    },
    {
        id: "8",
        slug: "bug-raporlari",
        name: "Bug Raporları",
        description: "Hata ve bug raporları",
        icon: <Bug className="w-6 h-6" />,
        color: "from-red-500 to-rose-600",
        topicCount: 28,
        postCount: 189,
        lastPost: {
            title: "[v1.9.2] Login hatası",
            author: "BugHunter",
            date: "2 gün önce",
        },
    },
];

// Mock data for recent topics
const recentTopics: ForumTopic[] = [
    {
        id: "1",
        title: "Tengra v2.0 Beta Test Programı Başvuruları Açıldı!",
        category: "Duyurular",
        categorySlug: "duyurular",
        author: { name: "Agnes" },
        replies: 47,
        views: 1234,
        lastReply: { author: "Kullanıcı456", date: "5 dakika önce" },
        isPinned: true,
    },
    {
        id: "2",
        title: "Yeni başlayanlar için rehber - Nereden başlamalı?",
        category: "Genel Tartışma",
        categorySlug: "genel-tartisma",
        author: { name: "Mentor" },
        replies: 89,
        views: 3456,
        lastReply: { author: "YeniUye", date: "12 dakika önce" },
        isPinned: true,
        isHot: true,
    },
    {
        id: "3",
        title: "Haftalık topluluk etkinliği önerileri",
        category: "Genel Tartışma",
        categorySlug: "genel-tartisma",
        author: { name: "EventOrg" },
        replies: 23,
        views: 456,
        lastReply: { author: "PartyLover", date: "1 saat önce" },
    },
    {
        id: "4",
        title: "GraphQL API kullanım örnekleri",
        category: "Geliştirici Köşesi",
        categorySlug: "gelistirici",
        author: { name: "DevMaster" },
        replies: 15,
        views: 234,
        lastReply: { author: "CodeNewbie", date: "2 saat önce" },
        isHot: true,
    },
    {
        id: "5",
        title: "En sevdiğiniz Tengra karakteri kim?",
        category: "Oyunlar",
        categorySlug: "oyunlar",
        author: { name: "GameFan" },
        replies: 156,
        views: 2341,
        lastReply: { author: "CharLover", date: "3 saat önce" },
        isHot: true,
    },
];

// Stats
const forumStats = {
    totalTopics: 554,
    totalPosts: 7674,
    totalMembers: 1234,
    onlineNow: 42,
    newestMember: "YeniKatilimci",
};

export default function ForumPage() {
    const { isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"categories" | "recent" | "popular">("categories");

    return (
        <SiteShell>
            <div className="min-h-screen px-4 py-8 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-[var(--color-turkish-blue-300)] to-[var(--color-turkish-blue-500)] bg-clip-text text-transparent mb-4">
                            Topluluk Forumu
                        </h1>
                        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                            Tartışmalara katılın, sorular sorun, fikirlerinizi paylaşın ve toplulukla etkileşime geçin.
                        </p>
                    </motion.div>

                    {/* Search & Actions Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col sm:flex-row gap-4 mb-8"
                    >
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Forumlarda ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(72,213,255,0.4)] transition-colors"
                            />
                        </div>

                        {/* New Topic Button */}
                        {isAuthenticated ? (
                            <Link href="/forum/new">
                                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Yeni Konu Aç
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login?next=/forum/new">
                                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Yeni Konu Aç
                                </Button>
                            </Link>
                        )}
                    </motion.div>

                    {/* Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                    >
                        {[
                            { label: "Konu", value: forumStats.totalTopics.toLocaleString(), icon: <MessageCircle className="w-4 h-4" /> },
                            { label: "Gönderi", value: forumStats.totalPosts.toLocaleString(), icon: <MessageSquare className="w-4 h-4" /> },
                            { label: "Üye", value: forumStats.totalMembers.toLocaleString(), icon: <Users className="w-4 h-4" /> },
                            { label: "Çevrimiçi", value: forumStats.onlineNow.toString(), icon: <Sparkles className="w-4 h-4" /> },
                            { label: "En Yeni", value: forumStats.newestMember, icon: <TrendingUp className="w-4 h-4" />, isName: true },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(15,31,54,0.4)] border border-[rgba(72,213,255,0.1)]"
                            >
                                <div className="text-[var(--color-turkish-blue-400)]">{stat.icon}</div>
                                <div>
                                    <p className={`font-semibold text-[var(--text-primary)] ${stat.isName ? 'text-sm' : ''}`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-2 mb-6 border-b border-[rgba(72,213,255,0.1)] pb-4"
                    >
                        {[
                            { id: "categories", label: "Kategoriler", icon: <MessageCircle className="w-4 h-4" /> },
                            { id: "recent", label: "Son Konular", icon: <Clock className="w-4 h-4" /> },
                            { id: "popular", label: "Popüler", icon: <Flame className="w-4 h-4" /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? "bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)] border border-[rgba(72,213,255,0.3)]"
                                        : "text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </motion.div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Categories / Topics List */}
                        <div className="lg:col-span-3 space-y-4">
                            {activeTab === "categories" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-3"
                                >
                                    {categories.map((category, index) => (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link href={`/forum/c/${category.slug}`}>
                                                <div className="group relative rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] hover:border-[rgba(72,213,255,0.3)] transition-all p-4 md:p-5">
                                                    <div className="flex items-start gap-4">
                                                        {/* Icon */}
                                                        <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg`}>
                                                            {category.icon}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-turkish-blue-300)] transition-colors">
                                                                    {category.name}
                                                                </h3>
                                                                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <p className="text-sm text-[var(--text-muted)] mb-3">
                                                                {category.description}
                                                            </p>

                                                            {/* Stats & Last Post */}
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                                                                <div className="flex items-center gap-3 text-[var(--text-muted)]">
                                                                    <span>{category.topicCount} konu</span>
                                                                    <span>•</span>
                                                                    <span>{category.postCount} gönderi</span>
                                                                </div>
                                                                {category.lastPost && (
                                                                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                                                        <Clock className="w-3 h-3" />
                                                                        <span className="truncate">
                                                                            {category.lastPost.title} — {category.lastPost.author}, {category.lastPost.date}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {(activeTab === "recent" || activeTab === "popular") && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
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
                                        {(activeTab === "popular"
                                            ? [...recentTopics].sort((a, b) => b.views - a.views)
                                            : recentTopics
                                        ).map((topic, index) => (
                                            <motion.div
                                                key={topic.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link href={`/forum/t/${topic.id}`}>
                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-[rgba(30,184,255,0.05)] transition-colors">
                                                        {/* Topic Info */}
                                                        <div className="md:col-span-6">
                                                            <div className="flex items-start gap-3">
                                                                {/* Author Avatar */}
                                                                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] flex items-center justify-center text-white text-sm font-medium">
                                                                    {topic.author.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                        {topic.isPinned && (
                                                                            <Pin className="w-3 h-3 text-amber-400" />
                                                                        )}
                                                                        {topic.isLocked && (
                                                                            <Lock className="w-3 h-3 text-[var(--text-muted)]" />
                                                                        )}
                                                                        {topic.isHot && (
                                                                            <Flame className="w-3 h-3 text-orange-400" />
                                                                        )}
                                                                        <h4 className="font-medium text-[var(--text-primary)] hover:text-[var(--color-turkish-blue-300)] transition-colors line-clamp-1">
                                                                            {topic.title}
                                                                        </h4>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                                        <span>{topic.author.name}</span>
                                                                        <span>•</span>
                                                                        <span className="text-[var(--color-turkish-blue-400)]">
                                                                            {topic.category}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Stats - Desktop */}
                                                        <div className="hidden md:flex md:col-span-2 items-center justify-center">
                                                            <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                                                                <MessageSquare className="w-4 h-4" />
                                                                {topic.replies}
                                                            </div>
                                                        </div>
                                                        <div className="hidden md:flex md:col-span-2 items-center justify-center">
                                                            <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
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
                                                        <div className="md:hidden flex items-center gap-4 text-xs text-[var(--text-muted)] ml-13">
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
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Online Users */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-5"
                            >
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Şu An Çevrimiçi
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {["Agnes", "DevMaster", "GameFan", "Artisan", "+38 daha"].map((user, i) => (
                                        <span
                                            key={i}
                                            className={`px-3 py-1 rounded-full text-xs ${i === 0
                                                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30"
                                                    : "bg-[rgba(30,184,255,0.1)] text-[var(--text-secondary)] border border-[rgba(72,213,255,0.1)]"
                                                }`}
                                        >
                                            {user}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Trending Topics */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 }}
                                className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-5"
                            >
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                                    Trend Konular
                                </h3>
                                <div className="space-y-3">
                                    {recentTopics
                                        .filter((t) => t.isHot)
                                        .slice(0, 5)
                                        .map((topic, i) => (
                                            <Link key={topic.id} href={`/forum/t/${topic.id}`}>
                                                <div className="flex items-start gap-3 group">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-[rgba(30,184,255,0.1)] flex items-center justify-center text-xs font-medium text-[var(--color-turkish-blue-400)]">
                                                        {i + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--color-turkish-blue-300)] transition-colors line-clamp-2">
                                                            {topic.title}
                                                        </p>
                                                        <p className="text-xs text-[var(--text-muted)] mt-1">
                                                            {topic.replies} yanıt • {topic.views.toLocaleString()} görüntülenme
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            </motion.div>

                            {/* Quick Links */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-5"
                            >
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Hızlı Bağlantılar</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: "Forum Kuralları", href: "/forum/rules" },
                                        { label: "SSS", href: "/faq" },
                                        { label: "Destek Merkezi", href: "/contact" },
                                        { label: "API Dökümantasyonu", href: "/docs" },
                                    ].map((link) => (
                                        <Link key={link.href} href={link.href}>
                                            <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all">
                                                {link.label}
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
