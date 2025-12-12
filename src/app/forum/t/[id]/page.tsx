"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import SiteShell from "@/components/layout/site-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { createForumPost, fetchThreadDetail } from "@/lib/forum";
import { ForumCategory, ForumPost, ForumThread } from "@/types/forum";
import {
    ChevronRight,
    MessageSquare,
    Eye,
    Pin,
    Flame,
    Clock,
    ArrowLeft,
    Share2,
    Flag,
    Quote,
    Award,
    Shield,
    Reply,
    Heart,
    Bookmark,
    Send,
    Loader2,
} from "lucide-react";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const renderMarkdown = (value: string) => {
    if (!value) return "";
    let html = escapeHtml(value);
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="my-3 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] text-xs overflow-x-auto"><code>$1</code></pre>');
    html = html.replace(/^### (.*)$/gm, '<h3 class="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2 class="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold text-[var(--text-primary)] mb-4">$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--text-primary)]">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-[rgba(0,0,0,0.3)]">$1</code>');
    html = html.replace(/\n{2,}/g, '</p><p class="mb-4">');
    html = html.replace(/\n/g, "<br/>");
    return `<p class="mb-4">${html}</p>`;
};

const formatDate = (value?: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function TopicPage() {
    const params = useParams();
    const topicId = params.id as string;
    const { isAuthenticated } = useAuth();

    const [thread, setThread] = useState<ForumThread | null>(null);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [category, setCategory] = useState<ForumCategory | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [likedReplies, setLikedReplies] = useState<Set<number>>(new Set());
    const [bookmarked, setBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        fetchThreadDetail(topicId)
            .then((data) => {
                if (!active) return;
                setThread(data.thread ?? null);
                setPosts(data.posts ?? []);
                setCategory(data.category ?? null);
                setError(null);
            })
            .catch(() => {
                if (!active) return;
                setError("Konu yüklenemedi.");
                setThread(null);
                setPosts([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [topicId]);

    const handleLikeReply = (replyId: number) => {
        setLikedReplies((prev) => {
            const next = new Set(prev);
            if (next.has(replyId)) {
                next.delete(replyId);
            } else {
                next.add(replyId);
            }
            return next;
        });
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim() || isSubmitting || !thread) return;
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
        if (!token) {
            toast.error("Yanıt yazmak için giriş yapmalısınız.");
            return;
        }
        setIsSubmitting(true);
        const newPost = await createForumPost(thread.id, replyContent, token);
        if (!newPost) {
            toast.error("Yanıt gönderilirken hata oluştu.");
            setIsSubmitting(false);
            return;
        }
        const hydrated = newPost.author ? newPost : { ...newPost, author: thread.author };
        setPosts((prev) => [...prev, hydrated]);
        setReplyContent("");
        toast.success("Yanıt gönderildi.");
        setIsSubmitting(false);
    };

    const getRoleBadge = (role?: string) => {
        switch (role) {
            case "admin":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
                        <Shield className="w-3 h-3" /> Admin
                    </span>
                );
            case "moderator":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30">
                        <Award className="w-3 h-3" /> Moderatör
                    </span>
                );
            default:
                return null;
        }
    };

    const renderedContent = useMemo(() => renderMarkdown(thread?.content ?? ""), [thread?.content]);
    const replyCount = posts.length;
    const categorySlug = category?.slug ?? thread?.category?.slug ?? "";
    const categoryName = category?.name ?? thread?.category?.name ?? "Kategori";
    const title = thread?.title ?? "Konu bulunamadı";
    const authorName = thread?.author?.displayName || thread?.author?.username || "Anonim";
    const createdAt = formatDate(thread?.createdAt) || "Az önce";
    const isHot = replyCount > 10;
    const views = thread?.viewCount ?? 0;
    const likesTotal = thread?.likeCount ?? 0;

    if (loading) {
        return (
            <SiteShell>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[var(--color-turkish-blue-400)] animate-spin" />
                </div>
            </SiteShell>
        );
    }

    if (!thread || error) {
        return (
            <SiteShell>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Konu bulunamadı</h1>
                        <p className="text-[var(--text-muted)]">Konu silinmiş veya taşınmış olabilir.</p>
                        <Link href="/forum">
                            <Button variant="primary">Foruma Dön</Button>
                        </Link>
                    </div>
                </div>
            </SiteShell>
        );
    }

    return (
        <SiteShell>
            <div className="min-h-screen px-4 py-8 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6 flex-wrap"
                    >
                        <Link href="/forum" className="hover:text-[var(--color-turkish-blue-400)] transition-colors">
                            Forum
                        </Link>
                        {categorySlug && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <Link href={`/forum/c/${categorySlug}`} className="hover:text-[var(--color-turkish-blue-400)] transition-colors">
                                    {categoryName}
                                </Link>
                            </>
                        )}
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-[var(--text-secondary)] line-clamp-1">{title}</span>
                    </motion.div>

                    {/* Topic Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            {thread.isPinned && <Pin className="w-5 h-5 text-amber-400 shrink-0 mt-1" />}
                            {isHot && <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-1" />}
                            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
                                {title}
                            </h1>
                        </div>

                        {/* Topic Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {createdAt}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" />
                                {views.toLocaleString("tr-TR")} görüntülenme
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4" />
                                {replyCount} yanıt
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Heart className="w-4 h-4" />
                                {likesTotal} beğeni
                            </span>
                        </div>
                    </motion.div>

                    {/* Original Post */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] overflow-hidden mb-6"
                    >
                        <div className="flex flex-col md:flex-row">
                            {/* Author Sidebar */}
                            <div className="md:w-48 shrink-0 p-5 bg-[rgba(0,0,0,0.2)] border-b md:border-b-0 md:border-r border-[rgba(72,213,255,0.05)]">
                                <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {authorName.charAt(0)}
                                    </div>
                                    <div className="md:text-center">
                                        <p className="font-semibold text-[var(--text-primary)]">{authorName}</p>
                                        {getRoleBadge(thread.author?.role)}
                                        {thread.author?.title && (
                                            <p className="text-xs text-[var(--text-muted)] mt-1">{thread.author.title}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-5">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div
                                        className="text-[var(--text-secondary)] whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                            __html: renderedContent,
                                        }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(72,213,255,0.05)]">
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all">
                                            <Heart className="w-4 h-4" />
                                            {likesTotal}
                                        </button>
                                        <button
                                            onClick={() => setBookmarked(!bookmarked)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${bookmarked
                                                    ? "text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.1)]"
                                                    : "text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                                                }`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all">
                                        <Flag className="w-4 h-4" />
                                        Raporla
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Replies */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
                            {replyCount} Yanıt
                        </h2>

                        {posts.map((reply, index) => {
                            const replyAuthorName = reply.author?.displayName || reply.author?.username || "Anonim";
                            const liked = likedReplies.has(reply.id);
                            const likes = (reply.likeCount ?? 0) + (liked ? 1 : 0);
                            return (
                                <motion.div
                                    key={reply.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                    className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Author */}
                                        <div className="md:w-40 shrink-0 p-4 bg-[rgba(0,0,0,0.1)] border-b md:border-b-0 md:border-r border-[rgba(72,213,255,0.05)]">
                                            <div className="flex md:flex-col items-center gap-3 md:text-center">
                                                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white text-sm md:text-lg font-medium ${reply.author?.role === "admin"
                                                        ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                        : reply.author?.role === "moderator"
                                                            ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                                            : "bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)]"
                                                    }`}>
                                                    {replyAuthorName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-[var(--text-primary)]">{replyAuthorName}</p>
                                                    {getRoleBadge(reply.author?.role)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4">
                                            <div
                                                className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap mb-4"
                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(reply.content) }}
                                            />

                                            {/* Reply Actions */}
                                            <div className="flex items-center justify-between pt-3 border-t border-[rgba(72,213,255,0.05)]">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleLikeReply(reply.id)}
                                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${liked
                                                                ? "text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.1)]"
                                                                : "text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                                                            }`}
                                                    >
                                                        <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
                                                        {likes}
                                                    </button>
                                                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all">
                                                        <Quote className="w-3.5 h-3.5" />
                                                        Alıntıla
                                                    </button>
                                                </div>
                                                <span className="text-xs text-[var(--text-muted)]">{formatDate(reply.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Reply Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-5"
                    >
                        {isAuthenticated ? (
                            <>
                                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <Reply className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
                                    Yanıt Yaz
                                </h3>
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={thread.isLocked ? "Bu konu kilitli." : "Yanıtınızı buraya yazın... Markdown desteklenir."}
                                    disabled={thread.isLocked}
                                    className="w-full h-32 px-4 py-3 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.1)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(72,213,255,0.3)] resize-none transition-colors"
                                />
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Markdown formatı desteklenir. **kalın**, *italik*, `kod`
                                    </p>
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmitReply}
                                        disabled={!replyContent.trim() || isSubmitting || thread.isLocked}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Gönderiliyor...
                                            </span>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Yanıtla
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-[var(--text-muted)] mb-4">Yanıt yazmak için giriş yapmalısınız.</p>
                                <Link href={`/login?next=/forum/t/${topicId}`}>
                                    <Button variant="primary">Giriş Yap</Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Back to Category */}
                    <div className="mt-8">
                        <Link href={categorySlug ? `/forum/c/${categorySlug}` : "/forum"} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            {categoryName} kategorisine dön
                        </Link>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
