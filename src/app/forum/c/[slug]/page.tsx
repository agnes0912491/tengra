"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteShell from "@/components/layout/site-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { fetchForumThreads } from "@/lib/forum";
import { getCategoryMeta } from "@/lib/forum-meta";
import { ForumCategory, ForumThread } from "@/types/forum";
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
    Loader2,
} from "lucide-react";

type SortOption = "latest" | "popular" | "replies" | "oldest";

const formatDate = (value?: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { isAuthenticated } = useAuth();

    const [sortBy, setSortBy] = useState<SortOption>("latest");
    const [category, setCategory] = useState<ForumCategory | null>(null);
    const [topics, setTopics] = useState<ForumThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        fetchForumThreads(slug, { pageSize: 50 })
            .then((data) => {
                if (!active) return;
                setCategory(data.category ?? null);
                setTopics(data.items ?? []);
                setError(null);
            })
            .catch(() => {
                if (!active) return;
                setError("Konular yüklenemedi.");
                setTopics([]);
                setCategory(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [slug]);

    const categoryMeta = useMemo(() => getCategoryMeta(category?.slug ?? slug), [category?.slug, slug]);

    const sortedTopics = useMemo(() => {
        const clone = [...topics];
        return clone.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            switch (sortBy) {
                case "popular":
                case "replies":
                    return (b.replyCount ?? 0) - (a.replyCount ?? 0);
                case "oldest":
                    return 0;
                default: {
                    const aDate = new Date(a.lastReplyAt ?? a.updatedAt ?? a.createdAt ?? "").getTime();
                    const bDate = new Date(b.lastReplyAt ?? b.updatedAt ?? b.createdAt ?? "").getTime();
                    return (isNaN(bDate) ? 0 : bDate) - (isNaN(aDate) ? 0 : aDate);
                }
            }
        });
    }, [topics, sortBy]);

    const CategoryIcon = categoryMeta.icon;
    const gradient = categoryMeta.bgGradient || "from-[var(--color-turkish-blue-600)] to-[var(--color-turkish-blue-400)]";

    if (!loading && !category && error) {
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

    if (loading) {
        return (
            <SiteShell>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[var(--color-turkish-blue-400)] animate-spin" />
                </div>
            </SiteShell>
        );
    }

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
                    <span className="text-[var(--text-secondary)]">{category?.name ?? slug}</span>
                </motion.div>

                {/* Category Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-6 md:p-8 mb-8 overflow-hidden"
                >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />

                    <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                        {/* Icon */}
                        <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                            <CategoryIcon className="w-8 h-8" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
                                    {category?.name ?? "Kategori"}
                            </h1>
                            <p className="text-[var(--text-secondary)]">{category?.description || categoryMeta.description}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-muted)]">
                                    <span>{(category?.threadCount ?? topics.length)} konu</span>
                                    <span>•</span>
                                    <span>{category?.postCount ?? topics.reduce((acc, t) => acc + (t.replyCount ?? 0), 0)} gönderi</span>
                            </div>
                        </div>

                        {/* New Topic Button */}
                        <div className="shrink-0">
                            <Link href={isAuthenticated ? `/forum/new?category=${category?.slug ?? slug}` : `/login?next=/forum/new?category=${category?.slug ?? slug}`}>
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
                                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${topic.author?.role === "admin"
                                                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                            : topic.author?.role === "moderator"
                                                                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                                                : "bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)]"
                                                        }`}>
                                                        {(topic.author?.displayName || topic.author?.username || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            {topic.isPinned && (
                                                                <Pin className="w-3.5 h-3.5 text-amber-400" />
                                                            )}
                                                            {topic.isLocked && (
                                                                <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                            )}
                                                            {(topic.replyCount ?? 0) > 20 && (
                                                                <Flame className="w-3.5 h-3.5 text-orange-400" />
                                                            )}
                                                            <h4 className="font-medium text-[var(--text-primary)] hover:text-[var(--color-turkish-blue-300)] transition-colors line-clamp-1">
                                                                {topic.title}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                            <span className={`${topic.author?.role === "admin"
                                                                    ? "text-amber-400"
                                                                    : topic.author?.role === "moderator"
                                                                        ? "text-emerald-400"
                                                                        : ""
                                                                }`}>
                                                                {topic.author?.displayName || topic.author?.username || "Anonim"}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{formatDate(topic.createdAt) || "Az önce"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats - Desktop */}
                                            <div className="hidden md:flex md:col-span-2 items-center justify-center">
                                                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                                                    <MessageSquare className="w-4 h-4" />
                                                    {topic.replyCount ?? 0}
                                                </div>
                                            </div>
                                            <div className="hidden md:flex md:col-span-2 items-center justify-center">
                                                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                                                    <Eye className="w-4 h-4" />
                                                    0
                                                </div>
                                            </div>
                                            <div className="hidden md:flex md:col-span-2 items-center justify-end text-right">
                                                <div className="text-xs">
                                                    <p className="text-[var(--text-secondary)]">
                                                        {topic.lastReplyAuthor?.displayName || topic.lastReplyAuthor?.username || topic.author?.displayName || topic.author?.username || "Topluluk"}
                                                    </p>
                                                    <p className="text-[var(--text-muted)]">{formatDate(topic.lastReplyAt ?? topic.updatedAt ?? topic.createdAt)}</p>
                                                </div>
                                            </div>

                                            {/* Stats - Mobile */}
                                            <div className="md:hidden flex items-center gap-4 text-xs text-[var(--text-muted)] pl-13">
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" /> {topic.replyCount ?? 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> 0
                                                </span>
                                                <span>{formatDate(topic.lastReplyAt ?? topic.updatedAt ?? topic.createdAt)}</span>
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
