"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import SiteShell from "@/components/layout/site-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronRight,
    ArrowLeft,
    Send,
    FileText,
    Tag,
    HelpCircle,
    Eye,
    Bold,
    Italic,
    Code,
    Link2,
    List,
    ListOrdered,

    Quote,
    Heading1,
    Heading2,

    MessageSquare,
    Gamepad2,
    Palette,
    Lightbulb,
    Bug,
} from "lucide-react";

// Categories
const categories = [
    { slug: "genel-tartisma", name: "Genel Tartışma", icon: <MessageSquare className="w-5 h-5" />, description: "Her konuda serbest tartışma" },
    { slug: "oyunlar", name: "Oyunlar", icon: <Gamepad2 className="w-5 h-5" />, description: "Oyunlar hakkında tartışmalar" },
    { slug: "gelistirici", name: "Geliştirici Köşesi", icon: <Code className="w-5 h-5" />, description: "Teknik tartışmalar" },
    { slug: "tasarim", name: "Tasarım & Sanat", icon: <Palette className="w-5 h-5" />, description: "Görsel tasarım paylaşımı" },
    { slug: "oneriler", name: "Öneriler & Fikirler", icon: <Lightbulb className="w-5 h-5" />, description: "Yeni özellik önerileri" },
    { slug: "destek", name: "Destek & Yardım", icon: <HelpCircle className="w-5 h-5" />, description: "Sorular ve yardım" },
    { slug: "bug-raporlari", name: "Bug Raporları", icon: <Bug className="w-5 h-5" />, description: "Hata raporları" },
];

// Markdown toolbar buttons
const toolbarButtons = [
    { icon: <Bold className="w-4 h-4" />, label: "Kalın", prefix: "**", suffix: "**" },
    { icon: <Italic className="w-4 h-4" />, label: "İtalik", prefix: "*", suffix: "*" },
    { icon: <Code className="w-4 h-4" />, label: "Kod", prefix: "`", suffix: "`" },
    { icon: <Link2 className="w-4 h-4" />, label: "Link", prefix: "[", suffix: "](url)" },
    { icon: <List className="w-4 h-4" />, label: "Liste", prefix: "\n- ", suffix: "" },
    { icon: <ListOrdered className="w-4 h-4" />, label: "Numaralı Liste", prefix: "\n1. ", suffix: "" },
    { icon: <Quote className="w-4 h-4" />, label: "Alıntı", prefix: "\n> ", suffix: "" },
    { icon: <Heading1 className="w-4 h-4" />, label: "Başlık 1", prefix: "\n# ", suffix: "" },
    { icon: <Heading2 className="w-4 h-4" />, label: "Başlık 2", prefix: "\n## ", suffix: "" },
];

export default function NewTopicPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");
    const { isAuthenticated } = useAuth();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(`/login?next=/forum/new${categoryParam ? `?category=${categoryParam}` : ""}`);
        }
    }, [isAuthenticated, router, categoryParam]);

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag) && tags.length < 5) {
            setTags([...tags, tag]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleToolbarClick = (prefix: string, suffix: string) => {
        const textarea = document.getElementById("content") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        const newContent =
            content.substring(0, start) +
            prefix +
            selectedText +
            suffix +
            content.substring(end);

        setContent(newContent);

        // Focus and set cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                start + prefix.length + selectedText.length
            );
        }, 0);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Lütfen bir başlık girin");
            return;
        }
        if (!content.trim()) {
            toast.error("Lütfen içerik girin");
            return;
        }
        if (!selectedCategory) {
            toast.error("Lütfen bir kategori seçin");
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            toast.success("Konu başarıyla oluşturuldu!");
            router.push(`/forum/c/${selectedCategory}`);
        } catch {
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <SiteShell>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-[var(--color-turkish-blue-400)] border-t-transparent rounded-full" />
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
                        className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6"
                    >
                        <Link href="/forum" className="hover:text-[var(--color-turkish-blue-400)] transition-colors">
                            Forum
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-[var(--text-secondary)]">Yeni Konu</span>
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
                            Yeni Konu Oluştur
                        </h1>
                        <p className="text-[var(--text-muted)]">
                            Topluluğa bir soru sorun, fikir paylaşın veya tartışma başlatın.
                        </p>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Category Selection */}
                        <div className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-5">
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                                Kategori Seçin *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.slug}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.slug)}
                                        className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${selectedCategory === cat.slug
                                                ? "bg-[rgba(30,184,255,0.15)] border-2 border-[var(--color-turkish-blue-400)]"
                                                : "bg-[rgba(0,0,0,0.2)] border-2 border-transparent hover:border-[rgba(72,213,255,0.2)]"
                                            }`}
                                    >
                                        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${selectedCategory === cat.slug
                                                ? "bg-[var(--color-turkish-blue-500)] text-white"
                                                : "bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-400)]"
                                            }`}>
                                            {cat.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-medium text-sm ${selectedCategory === cat.slug
                                                    ? "text-[var(--color-turkish-blue-300)]"
                                                    : "text-[var(--text-primary)]"
                                                }`}>
                                                {cat.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] line-clamp-1">{cat.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-5">
                            <label htmlFor="title" className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                                Başlık *
                            </label>
                            <Input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Konunuzun başlığını girin..."
                                maxLength={150}
                                className="text-lg"
                            />
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                {title.length}/150 karakter
                            </p>
                        </div>

                        {/* Content */}
                        <div className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <label htmlFor="content" className="block text-sm font-medium text-[var(--text-primary)]">
                                    İçerik *
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(false)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${!showPreview
                                                ? "bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)]"
                                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                            }`}
                                    >
                                        <FileText className="w-3 h-3 inline mr-1" />
                                        Düzenle
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(true)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${showPreview
                                                ? "bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)]"
                                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                            }`}
                                    >
                                        <Eye className="w-3 h-3 inline mr-1" />
                                        Önizle
                                    </button>
                                </div>
                            </div>

                            {/* Toolbar */}
                            {!showPreview && (
                                <div className="flex flex-wrap gap-1 mb-3 p-2 rounded-lg bg-[rgba(0,0,0,0.2)]">
                                    {toolbarButtons.map((btn, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleToolbarClick(btn.prefix, btn.suffix)}
                                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.1)] transition-all"
                                            title={btn.label}
                                        >
                                            {btn.icon}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showPreview ? (
                                <div className="min-h-[200px] p-4 rounded-xl bg-[rgba(0,0,0,0.2)] text-[var(--text-secondary)]">
                                    {content ? (
                                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                                            {content
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-[rgba(0,0,0,0.3)]">$1</code>')
                                            }
                                        </div>
                                    ) : (
                                        <p className="text-[var(--text-muted)] italic">Önizlenecek içerik yok...</p>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Konunuzun içeriğini buraya yazın... Markdown formatı desteklenir."
                                    className="w-full h-64 px-4 py-3 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.1)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(72,213,255,0.3)] resize-none transition-colors"
                                />
                            )}
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                Markdown formatı desteklenir: **kalın**, *italik*, `kod`, [link](url)
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.1)] p-5">
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                                Etiketler (Opsiyonel)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-300)] border border-[rgba(72,213,255,0.2)]"
                                    >
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                    placeholder="Etiket ekle..."
                                    maxLength={20}
                                    disabled={tags.length >= 5}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAddTag}
                                    disabled={!tagInput.trim() || tags.length >= 5}
                                >
                                    Ekle
                                </Button>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                En fazla 5 etiket ekleyebilirsiniz. ({tags.length}/5)
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                            <Link href="/forum" className="text-sm text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] transition-colors flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                İptal
                            </Link>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategory}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Oluşturuluyor...
                                    </span>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Konu Oluştur
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Guidelines */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 rounded-xl bg-[rgba(15,31,54,0.4)] border border-[rgba(72,213,255,0.05)] p-5"
                    >
                        <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
                            Konu Açma Kuralları
                        </h3>
                        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                            <li>• Açıklayıcı ve anlaşılır bir başlık kullanın</li>
                            <li>• Doğru kategoriyi seçtiğinizden emin olun</li>
                            <li>• Aynı konuyu tekrar açmadan önce arama yapın</li>
                            <li>• Saygılı ve yapıcı bir dil kullanın</li>
                            <li>• Spam, reklam ve uygunsuz içerik paylaşmayın</li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </SiteShell>
    );
}
