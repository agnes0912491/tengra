"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import SiteShell from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchForumCategories, fetchOnlineUsers } from "@/lib/forum";
import { getCategoryMeta, ForumCategoryMeta } from "@/lib/forum-meta";
import { ForumCategory } from "@/types/forum";
import { Hash, MessageCircle, Users } from "lucide-react";
import { useTranslation } from "@tengra/language";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://tengra.studio";
const LOGIN_URL = `${SITE_ORIGIN}/login`;

type Section = {
    title: string;
    categories: Array<{ category: ForumCategory; meta: ForumCategoryMeta }>;
};

const formatDate = (value?: string | null, locale: string = "tr-TR") => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString(locale, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function ForumPage() {
    const { isAuthenticated } = useAuth();
    const { t } = useTranslation("Forum");
    const { t: tRoot } = useTranslation();
    const { language: locale } = useTranslation();

    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<{ name: string; role?: string }[]>([]);
    const [onlineLoading, setOnlineLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        fetchForumCategories()
            .then((items) => {
                if (!active) return;
                setCategories(items);
                setError(null);
            })
            .catch(() => {
                if (!active) return;
                setError(t("loadingError"));
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [t]);

    const sections = useMemo<Section[]>(() => {
        const grouped: Record<string, Section["categories"]> = {};
        categories.forEach((cat) => {
            const meta = getCategoryMeta(cat.slug);
            const key = meta.section ? tRoot(meta.section) : t("sections.community");
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ category: cat, meta });
        });

        // Define localized order
        const sectionOrder = [
            t("sections.tengraStudio"),
            t("sections.projects"),
            t("sections.support"),
            t("sections.community")
        ];

        const built: Section[] = [];
        sectionOrder.forEach((title) => {
            if (grouped[title] && grouped[title].length > 0) {
                built.push({ title, categories: grouped[title] });
            }
        });
        Object.keys(grouped).forEach((title) => {
            if (!sectionOrder.includes(title)) {
                built.push({ title, categories: grouped[title] });
            }
        });
        return built;
    }, [categories, t, tRoot]);

    useEffect(() => {
        let active = true;
        fetchOnlineUsers()
            .then((items) => {
                if (!active) return;
                setOnlineUsers(
                    items.map((u) => ({
                        name: u.displayName || u.username,
                        role: u.role,
                    }))
                );
            })
            .catch(() => {
                if (!active) return;
                setOnlineUsers([]);
            })
            .finally(() => {
                if (active) setOnlineLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const totalTopics = categories.reduce((sum, c) => sum + (c.threadCount ?? 0), 0);
    const totalPosts = categories.reduce((sum, c) => sum + (c.postCount ?? 0), 0);
    const sidebarStats = [
        { label: t("stats.topics"), value: totalTopics.toLocaleString(locale), icon: Hash },
        { label: t("stats.posts"), value: totalPosts.toLocaleString(locale), icon: MessageCircle },
        { label: t("stats.categories"), value: categories.length.toString(), icon: Users },
    ];

    return (
        <SiteShell>
            <div className="min-h-screen px-4 py-8 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb / Title Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{t("title")}</h1>
                            <p className="text-sm text-gray-400">{t("subtitle")}</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    id="forum-search"
                                    name="search"
                                    type="search"
                                    autoComplete="off"
                                    aria-label={t("search")}
                                    placeholder={t("search")}
                                    className="pl-9 pr-4 py-2 rounded-lg bg-[#141b25] border border-[#1f2937] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1eb8ff] transition-colors w-full md:w-64"
                                />
                            </div>
                            {isAuthenticated ? (
                                <Link href="/forum/new">
                                    <Button size="default" className="bg-[#1eb8ff] hover:bg-[#0097d4] text-white">
                                        {t("createTopic")}
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={LOGIN_URL}>
                                    <Button variant="outline" size="default">
                                        {t("loginToPost")}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main Board List */}
                        <div className="lg:col-span-3 space-y-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 text-[var(--color-turkish-blue-400)] animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 p-4 text-sm">
                                    {error}
                                </div>
                            ) : sections.length === 0 ? (
                                <div className="rounded-xl border border-[#1f2937] bg-[#111821] p-8 text-center text-gray-400">
                                    {t("noCategories")}
                                </div>
                            ) : (
                                sections.map((section) => (
                                    <div key={section.title} className="rounded-xl border border-[#1f2937] bg-[#111821] overflow-hidden">
                                        <div className="px-5 py-3 bg-[#161e2a] border-b border-[#1f2937]">
                                            <h2 className="text-sm font-bold text-[#1eb8ff] uppercase tracking-wide">
                                                {section.title}
                                            </h2>
                                        </div>
                                        <div className="divide-y divide-[#1f2937]">
                                            {section.categories.map(({ category, meta }) => {
                                                const Icon = meta.icon;
                                                const topics = category.threadCount ?? 0;
                                                const posts = category.postCount ?? 0;
                                                const lastThread = category.lastThread;
                                                const lastAuthor = lastThread?.author?.displayName || lastThread?.author?.username || "";
                                                const lastDate = formatDate(lastThread?.updatedAt ?? category.lastActivityAt ?? lastThread?.lastReplyAt, locale);
                                                const lastLink = lastThread?.id ? `/forum/t/${lastThread.id}` : "#";
                                                const description = category.description || (meta.description ? tRoot(meta.description) : "");

                                                return (
                                                    <div key={category.id} className="group flex flex-col md:flex-row items-center gap-4 p-4 hover:bg-[#161e2a]/50 transition-colors">
                                                        <div className="flex-shrink-0 relative">
                                                            <div className={`w-10 h-10 rounded-lg bg-[#0a0f16] flex items-center justify-center border border-[#1f2937] group-hover:border-[#1eb8ff]/30 transition-colors`}>
                                                                <Icon className={`w-5 h-5 ${meta.colorClass}`} />
                                                            </div>
                                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#1eb8ff] rounded-full border-2 border-[#111821]" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 w-full text-center md:text-left">
                                                            <Link href={`/forum/c/${category.slug}`} className="block">
                                                                <h3 className="text-base font-semibold text-gray-200 group-hover:text-[#1eb8ff] transition-colors mb-0.5">
                                                                    {category.name}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-400">
                                                                    {description}
                                                                </p>
                                                            </Link>
                                                        </div>
                                                        <div className="hidden md:flex gap-6 text-xs text-gray-500 min-w-[120px] justify-end">
                                                            <div className="text-right">
                                                                <span className="block text-gray-300 font-medium">{topics}</span>
                                                                <span>{t("stats.topics")}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="block text-gray-300 font-medium">{posts}</span>
                                                                <span>{t("stats.posts")}</span>
                                                            </div>
                                                        </div>
                                                        <div className="hidden md:block w-64 pl-4 border-l border-[#1f2937/50]">
                                                            {lastThread ? (
                                                                <div className="flex items-start gap-2.5">
                                                                    <div className="w-8 h-8 rounded-full bg-[#1f2937] flex-shrink-0 overflow-hidden">
                                                                        <div className="w-full h-full bg-gradient-to-br from-[#1eb8ff] to-[#0097d4] flex items-center justify-center text-xs font-bold text-white">
                                                                            {(lastAuthor || "T").charAt(0).toUpperCase()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <Link href={lastLink} className="block text-sm text-[#1eb8ff] hover:underline truncate">
                                                                            {lastThread.title}
                                                                        </Link>
                                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                            <span>{lastDate || t("time.justNow")}</span>
                                                                            {lastAuthor ? (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <span className="text-gray-400">{lastAuthor}</span>
                                                                                </>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-600">{t("noMessages")}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* User Info / Login CTA */}
                            {!isAuthenticated ? (
                                <div className="rounded-xl border border-[#1f2937] bg-[#111821] p-5 text-center">
                                    <h3 className="text-white font-semibold mb-2">{t("sidebar.joinTitle")}</h3>
                                    <p className="text-xs text-gray-400 mb-4">
                                        {t("sidebar.joinDesc")}
                                    </p>
                                    <Link href="/register" className="block w-full">
                                        <Button className="w-full bg-[#1eb8ff] hover:bg-[#0097d4]">
                                            {t("sidebar.register")}
                                        </Button>
                                    </Link>
                                </div>
                            ) : null}

                            {/* Online Users */}
                            <div className="rounded-xl border border-[#1f2937] bg-[#111821] overflow-hidden">
                                <div className="bg-[#161e2a] px-4 py-3 border-b border-[#1f2937] flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-gray-300 uppercase">{t("sidebar.onlineTitle")}</h3>
                                    <span className="flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                </div>
                                <div className="p-4">
                                    {onlineLoading ? (
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t("sidebar.loadingUsers")}
                                        </div>
                                    ) : onlineUsers.length === 0 ? (
                                        <span className="text-xs text-gray-500">{t("sidebar.noOnlineUsers")}</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {onlineUsers.map((u, i) => (
                                                <span
                                                    key={`${u.name}-${i}`}
                                                    className={`text-xs px-2 py-1 rounded bg-[#1f2937] text-gray-300 hover:text-white cursor-pointer transition-colors ${u.role === "admin" ? "text-amber-400 font-medium" : u.role === "moderator" ? "text-emerald-400" : ""}`}
                                                >
                                                    {u.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Forum Statistics */}
                            <div className="rounded-xl border border-[#1f2937] bg-[#111821] overflow-hidden">
                                <div className="bg-[#161e2a] px-4 py-3 border-b border-[#1f2937]">
                                    <h3 className="text-xs font-bold text-gray-300 uppercase">{t("sidebar.statsTitle")}</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {sidebarStats.map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 rounded bg-[#1f2937] text-gray-400">
                                                    <stat.icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm text-gray-400">{stat.label}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-200">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
