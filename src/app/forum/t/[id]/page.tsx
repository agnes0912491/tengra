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
    MessageSquare,
    Eye,
    Pin,
    Flame,
    Clock,
    ArrowLeft,
    Share2,
    Flag,
    Quote,
    CheckCircle,
    Award,
    Shield,

    Reply,
    Heart,
    Bookmark,
    Send,
} from "lucide-react";

// Mock topic data
const mockTopic = {
    id: "1",
    title: "Tengra v2.0 Beta Test Programı - Başvurular Açık!",
    category: { name: "Duyurular", slug: "duyurular" },
    author: {
        name: "Agnes",
        avatar: null,
        role: "admin",
        title: "Kurucu",
        joinDate: "Ocak 2023",
        postCount: 1234,
        reputation: 9876,
    },
    content: `
# Tengra v2.0 Beta Test Programı

Merhaba değerli topluluk üyeleri! 👋

Uzun süredir üzerinde çalıştığımız **Tengra v2.0** güncellemesinin beta test programını başlatmaktan heyecan duyuyoruz!

## Yeni Özellikler

- 🎮 **Geliştirilmiş Oyun Motoru**: Daha akıcı performans ve görsel iyileştirmeler
- 🔧 **Yeni API Endpoints**: Geliştiriciler için daha güçlü araçlar
- 🎨 **UI/UX Yenilikleri**: Modern ve kullanıcı dostu arayüz
- 🌙 **Gelişmiş Karanlık Mod**: Göz yorgunluğunu azaltan yeni tema
- 📱 **Mobil Optimizasyon**: Responsive tasarım iyileştirmeleri

## Nasıl Katılabilirim?

1. Bu konuya yorum yaparak ilginizi belirtin
2. [Beta başvuru formunu](https://forms.tengra.studio/beta) doldurun
3. Email onayını bekleyin
4. Beta sürümüne erişin ve test edin!

## Gereksinimler

- Aktif bir Tengra hesabı
- En az 1 aydır üye olmak
- Discord sunucumuza katılmış olmak

## Timeline

| Aşama | Tarih |
|-------|-------|
| Başvurular | 1-15 Aralık |
| Seçim | 16-20 Aralık |
| Beta Başlangıcı | 25 Aralık |
| Genel Yayın | Ocak 2026 |

---

Sorularınız için bu konuya yorum yapabilir veya [Discord sunucumuza](https://discord.tengra.studio) katılabilirsiniz.

Herkese iyi testler! 🚀
  `,
    createdAt: "3 gün önce",
    views: 4523,
    likes: 234,
    isPinned: true,
    isHot: true,
};

// Mock replies
const mockReplies = [
    {
        id: "r1",
        author: {
            name: "BetaTester",
            role: "member",
            title: "Beta Tester",
            joinDate: "Mart 2023",
            postCount: 456,
            reputation: 1234,
        },
        content: "Heyecanla bekliyordum! Hemen başvuru formunu dolduruyorum. Özellikle yeni API endpoint'leri için çok heyecanlıyım. 🎉",
        createdAt: "2 gün önce",
        likes: 45,
        isLiked: true,
    },
    {
        id: "r2",
        author: {
            name: "DevMaster",
            role: "moderator",
            title: "Kıdemli Geliştirici",
            joinDate: "Şubat 2023",
            postCount: 892,
            reputation: 3456,
        },
        content: `API değişiklikleri hakkında daha fazla bilgi alabilir miyiz? Özellikle rate limiting ve yeni authentication flow hakkında merak ediyorum.

\`\`\`javascript
// Örnek: Yeni API kullanımı
const client = new TengraClient({
  apiKey: process.env.TENGRA_API_KEY,
  version: 'v2'
});
\`\`\`

Bu şekilde mi olacak?`,
        createdAt: "2 gün önce",
        likes: 78,
        isLiked: false,
    },
    {
        id: "r3",
        author: {
            name: "Agnes",
            role: "admin",
            title: "Kurucu",
            joinDate: "Ocak 2023",
            postCount: 1234,
            reputation: 9876,
        },
        content: `@DevMaster harika soru! 

Evet, yeni API client tam olarak böyle çalışacak. Ayrıca:
- Rate limiting artık hesap bazlı değil, endpoint bazlı olacak
- OAuth 2.0 desteği eklenecek
- Webhook entegrasyonları gelecek

Detaylı dökümantasyonu beta başladığında yayınlayacağız.`,
        createdAt: "1 gün önce",
        likes: 123,
        isLiked: true,
        isAccepted: true,
    },
    {
        id: "r4",
        author: {
            name: "NewUser",
            role: "member",
            title: "Yeni Üye",
            joinDate: "Kasım 2024",
            postCount: 12,
            reputation: 45,
        },
        content: "1 aylık üyelik şartını karşılamıyorum ama çok merak ediyorum. Bir sonraki beta programı için bekleyeceğim! 😊",
        createdAt: "1 gün önce",
        likes: 15,
        isLiked: false,
    },
    {
        id: "r5",
        author: {
            name: "DesignFan",
            role: "member",
            title: "UI Enthusiast",
            joinDate: "Haziran 2023",
            postCount: 234,
            reputation: 890,
        },
        content: "UI/UX yeniliklerini duyunca çok heyecanlandım! Özellikle karanlık mod iyileştirmeleri harika olacak. Figma prototipleri paylaşılacak mı?",
        createdAt: "12 saat önce",
        likes: 34,
        isLiked: false,
    },
];

export default function TopicPage() {
    const params = useParams();
    const topicId = params.id as string;
    const { isAuthenticated } = useAuth();

    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set(["r1", "r3"]));
    const [bookmarked, setBookmarked] = useState(false);

    const handleLikeReply = (replyId: string) => {
        setLikedReplies((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(replyId)) {
                newSet.delete(replyId);
            } else {
                newSet.add(replyId);
            }
            return newSet;
        });
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim() || isSubmitting) return;
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setReplyContent("");
        setIsSubmitting(false);
    };

    const getRoleBadge = (role: string) => {
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
                        <ChevronRight className="w-4 h-4" />
                        <Link href={`/forum/c/${mockTopic.category.slug}`} className="hover:text-[var(--color-turkish-blue-400)] transition-colors">
                            {mockTopic.category.name}
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-[var(--text-secondary)] line-clamp-1">{mockTopic.title}</span>
                    </motion.div>

                    {/* Topic Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            {mockTopic.isPinned && <Pin className="w-5 h-5 text-amber-400 shrink-0 mt-1" />}
                            {mockTopic.isHot && <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-1" />}
                            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)]">
                                {mockTopic.title}
                            </h1>
                        </div>

                        {/* Topic Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {mockTopic.createdAt}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" />
                                {mockTopic.views.toLocaleString()} görüntülenme
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4" />
                                {mockReplies.length} yanıt
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Heart className="w-4 h-4" />
                                {mockTopic.likes} beğeni
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
                                    {/* Avatar */}
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {mockTopic.author.name.charAt(0)}
                                    </div>
                                    <div className="md:text-center">
                                        <p className="font-semibold text-[var(--text-primary)]">{mockTopic.author.name}</p>
                                        {getRoleBadge(mockTopic.author.role)}
                                        <p className="text-xs text-[var(--text-muted)] mt-1">{mockTopic.author.title}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block mt-4 pt-4 border-t border-[rgba(72,213,255,0.05)] space-y-2 text-xs text-[var(--text-muted)]">
                                    <div className="flex justify-between">
                                        <span>Katılım</span>
                                        <span className="text-[var(--text-secondary)]">{mockTopic.author.joinDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Gönderiler</span>
                                        <span className="text-[var(--text-secondary)]">{mockTopic.author.postCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Puan</span>
                                        <span className="text-[var(--color-turkish-blue-400)]">{mockTopic.author.reputation}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-5">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div
                                        className="text-[var(--text-secondary)] whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                            __html: mockTopic.content
                                                .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-[var(--text-primary)] mb-4">$1</h1>')
                                                .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">$1</h2>')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--text-primary)]">$1</strong>')
                                                .replace(/\n- /g, '<br/>• ')
                                                .replace(/\n\n/g, '</p><p class="mb-4">')
                                        }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(72,213,255,0.05)]">
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all">
                                            <Heart className="w-4 h-4" />
                                            {mockTopic.likes}
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
                            {mockReplies.length} Yanıt
                        </h2>

                        {mockReplies.map((reply, index) => (
                            <motion.div
                                key={reply.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                className={`rounded-xl bg-[rgba(15,31,54,0.6)] border overflow-hidden ${reply.isAccepted
                                        ? "border-emerald-500/30 ring-1 ring-emerald-500/20"
                                        : "border-[rgba(72,213,255,0.1)]"
                                    }`}
                            >
                                {reply.isAccepted && (
                                    <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2 text-sm text-emerald-400">
                                        <CheckCircle className="w-4 h-4" />
                                        Kabul Edilen Yanıt
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row">
                                    {/* Author */}
                                    <div className="md:w-40 shrink-0 p-4 bg-[rgba(0,0,0,0.1)] border-b md:border-b-0 md:border-r border-[rgba(72,213,255,0.05)]">
                                        <div className="flex md:flex-col items-center gap-3 md:text-center">
                                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white text-sm md:text-lg font-medium ${reply.author.role === "admin"
                                                    ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                    : reply.author.role === "moderator"
                                                        ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                                        : "bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)]"
                                                }`}>
                                                {reply.author.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-[var(--text-primary)]">{reply.author.name}</p>
                                                {getRoleBadge(reply.author.role)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap mb-4">
                                            {reply.content.split('```').map((part, i) =>
                                                i % 2 === 1 ? (
                                                    <pre key={i} className="my-3 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] text-xs overflow-x-auto">
                                                        <code>{part.replace(/^[a-z]+\n/, '')}</code>
                                                    </pre>
                                                ) : (
                                                    <span key={i}>{part}</span>
                                                )
                                            )}
                                        </div>

                                        {/* Reply Actions */}
                                        <div className="flex items-center justify-between pt-3 border-t border-[rgba(72,213,255,0.05)]">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleLikeReply(reply.id)}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${likedReplies.has(reply.id)
                                                            ? "text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.1)]"
                                                            : "text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                                                        }`}
                                                >
                                                    <Heart className={`w-3.5 h-3.5 ${likedReplies.has(reply.id) ? "fill-current" : ""}`} />
                                                    {reply.likes + (likedReplies.has(reply.id) && !reply.isLiked ? 1 : 0) - (!likedReplies.has(reply.id) && reply.isLiked ? 1 : 0)}
                                                </button>
                                                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all">
                                                    <Quote className="w-3.5 h-3.5" />
                                                    Alıntıla
                                                </button>
                                            </div>
                                            <span className="text-xs text-[var(--text-muted)]">{reply.createdAt}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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
                                    placeholder="Yanıtınızı buraya yazın... Markdown desteklenir."
                                    className="w-full h-32 px-4 py-3 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.1)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(72,213,255,0.3)] resize-none transition-colors"
                                />
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Markdown formatı desteklenir. **kalın**, *italik*, `kod`
                                    </p>
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmitReply}
                                        disabled={!replyContent.trim() || isSubmitting}
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
                        <Link href={`/forum/c/${mockTopic.category.slug}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            {mockTopic.category.name} kategorisine dön
                        </Link>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
