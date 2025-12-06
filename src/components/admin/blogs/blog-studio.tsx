"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "react-toastify";
import { CalendarClock, Edit3, Eye, FilePlus, Filter, Loader2, Save, Search, Upload, X } from "lucide-react";

import type { Blog, BlogCategory } from "@/types/blog";
import { createBlog, getAllBlogCategories, updateBlog, uploadImage } from "@/lib/db";
import { cn, slugify } from "@/lib/utils";

const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false });

type BlogStudioProps = {
  initialBlogs: Blog[];
};

type Draft = {
  id?: string;
  title: string;
  slug: string;
  subtitle?: string;
  status: Blog["status"];
  publishAt?: string;
  excerpt: string;
  content: string;
  image?: string;
  tags: string[];
  categories: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
};

const defaultDraft = (): Draft => ({
  title: "",
  slug: "",
  status: "draft",
  publishAt: "",
  excerpt: "",
  content: "",
  tags: [],
  categories: [],
});

function DraftForm({
  draft,
  onChange,
  onSave,
  onClose,
  saving,
  categories,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
  saving: boolean;
  categories: BlogCategory[];
}) {
  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = String(reader.result ?? "");
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Görsel yüklemek için giriş yapın.");
          return;
        }
        const uploaded = await uploadImage(dataUrl, token);
        if (uploaded?.url) {
          onChange({ ...draft, image: uploaded.url });
          toast.success("Kapak görseli yüklendi.");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Kapak yüklenemedi.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <input
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })}
            placeholder="Başlık"
            className="w-full rounded-xl border border-[rgba(72,213,255,0.25)] bg-[rgba(8,18,26,0.8)] px-4 py-3 text-lg font-semibold text-white outline-none"
          />
          <input
            value={draft.subtitle ?? ""}
            onChange={(e) => onChange({ ...draft, subtitle: e.target.value })}
            placeholder="Alt başlık (opsiyonel)"
            className="w-full rounded-xl border border-[rgba(72,213,255,0.15)] bg-[rgba(8,18,26,0.65)] px-4 py-2 text-sm text-[rgba(255,255,255,0.85)] outline-none"
          />
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-[rgba(255,255,255,0.15)] p-2 text-[rgba(255,255,255,0.65)] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          Slug
          <input
            value={draft.slug}
            onChange={(e) => onChange({ ...draft, slug: slugify(e.target.value) })}
            placeholder="yeni-blog-slug"
            className="w-full rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          Durum
          <select
            value={draft.status ?? "draft"}
            onChange={(e) => onChange({ ...draft, status: e.target.value as Draft["status"] })}
            className="w-full rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
          >
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
            <option value="scheduled">Planlı</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          Yayın Tarihi
          <input
            type="datetime-local"
            value={draft.publishAt ?? ""}
            onChange={(e) => onChange({ ...draft, publishAt: e.target.value })}
            className="w-full rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          Kapak Görseli URL
          <input
            value={draft.image ?? ""}
            onChange={(e) => onChange({ ...draft, image: e.target.value })}
            placeholder="https://..."
            className="w-full rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
          />
        </label>
        <div className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          <span>Kapak Yükle</span>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[rgba(72,213,255,0.3)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.85)]">
            <Upload className="h-4 w-4" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            Dosya seç
          </label>
        </div>
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          Etiketler
          <input
            value={draft.tags.join(", ")}
            onChange={(e) => onChange({ ...draft, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
            placeholder="ai, devops, nextjs"
            className="w-full rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          Kategoriler
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = draft.categories.includes(cat.name);
              return (
                <button
                  key={cat.slug ?? cat.name}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...draft,
                      categories: active
                        ? draft.categories.filter((c) => c !== cat.name)
                        : [...draft.categories, cat.name],
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    active
                      ? "border-[rgba(72,213,255,0.4)] bg-[rgba(72,213,255,0.15)] text-[rgba(130,226,255,0.95)]"
                      : "border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.7)] hover:border-[rgba(72,213,255,0.3)]"
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </label>
      </div>

      <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
        Özet
        <textarea
          value={draft.excerpt}
          onChange={(e) => onChange({ ...draft, excerpt: e.target.value })}
          rows={2}
          className="w-full rounded-xl border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
        />
      </label>

      <div className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
        <div className="flex items-center justify-between">
          <span>İçerik</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.5)]">Rich text</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)]">
          <MDEditor
            value={draft.content}
            onChange={(v) => onChange({ ...draft, content: v ?? "" })}
            height={360}
            preview="edit"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          SEO Başlık
          <input
            value={draft.seoTitle ?? ""}
            onChange={(e) => onChange({ ...draft, seoTitle: e.target.value })}
            placeholder={draft.title}
            className="w-full rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          SEO Açıklama
          <input
            value={draft.seoDescription ?? ""}
            onChange={(e) => onChange({ ...draft, seoDescription: e.target.value })}
            placeholder={draft.excerpt}
            className="w-full rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
          Kanonik URL
          <input
            value={draft.canonicalUrl ?? ""}
            onChange={(e) => onChange({ ...draft, canonicalUrl: e.target.value })}
            placeholder="https://tengra.studio/blogs/..."
            className="w-full rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] px-3 py-2 text-[rgba(255,255,255,0.9)] outline-none"
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-full border border-[rgba(255,255,255,0.2)] px-4 py-2 text-sm text-[rgba(255,255,255,0.75)] hover:border-[rgba(255,255,255,0.35)]"
        >
          Vazgeç
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(72,213,255,0.85)] to-[rgba(0,167,197,0.85)] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>
    </div>
  );
}

export default function BlogStudio({ initialBlogs }: BlogStudioProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Blog["status"] | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [draft, setDraft] = useState<Draft>(() => defaultDraft());
  const [composerOpen, setComposerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  useEffect(() => {
    getAllBlogCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs
      .filter((blog) => (statusFilter === "all" ? true : blog.status === statusFilter))
      .filter((blog) =>
        categoryFilter === "all" ? true : blog.categories.some((cat) => cat.name === categoryFilter)
      )
      .filter((blog) => {
        if (!q) return true;
        return (
          blog.title.toLowerCase().includes(q) ||
          blog.excerpt.toLowerCase().includes(q) ||
          (blog.summary ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.publishAt ?? b.date).localeCompare(a.publishAt ?? a.date));
  }, [blogs, statusFilter, categoryFilter, search]);

  const openComposer = (blog?: Blog) => {
    if (blog) {
      setDraft({
        id: blog.id,
        title: blog.title,
        slug: blog.slug ?? slugify(blog.title),
        subtitle: blog.subtitle,
        status: blog.status ?? "draft",
        publishAt: blog.publishAt ?? "",
        excerpt: blog.excerpt,
        content: blog.content,
        image: blog.image,
        tags: blog.tags ?? [],
        categories: blog.categories.map((c) => c.name),
        seoTitle: blog.seo?.title,
        seoDescription: blog.seo?.description,
        canonicalUrl: blog.seo?.canonicalUrl,
      });
    } else {
      setDraft(defaultDraft());
    }
    setComposerOpen(true);
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast.error("Başlık ve içerik zorunludur.");
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      toast.error("Önce giriş yapın.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: draft.id,
        title: draft.title,
        slug: draft.slug || slugify(draft.title),
        subtitle: draft.subtitle,
        status: draft.status,
        publishAt: draft.publishAt,
        excerpt: draft.excerpt,
        content: draft.content,
        image: draft.image,
        heroImage: draft.image,
        tags: draft.tags,
        categories: draft.categories,
        seo: {
          title: draft.seoTitle,
          description: draft.seoDescription,
          canonicalUrl: draft.canonicalUrl,
        },
      };

      const saved = draft.id
        ? await updateBlog(draft.id, payload, token)
        : await createBlog(payload, token);

      if (!saved) {
        toast.error("Blog kaydedilemedi.");
        return;
      }

      setBlogs((prev) => {
        const others = prev.filter((b) => b.id !== saved.id);
        return [saved, ...others].sort((a, b) => (b.publishAt ?? b.date).localeCompare(a.publishAt ?? a.date));
      });
      toast.success("Blog kaydedildi.");
      setComposerOpen(false);
    } catch (error) {
      console.error("Failed to save blog", error);
      toast.error("Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === "published").length;
    const drafts = blogs.filter((b) => b.status === "draft").length;
    const scheduled = blogs.filter((b) => b.status === "scheduled").length;
    return { total, published, drafts, scheduled };
  }, [blogs]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.7)] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]">Toplam</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.7)] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]">Yayında</p>
          <p className="mt-2 text-2xl font-bold text-green-400">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.7)] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]">Taslak</p>
          <p className="mt-2 text-2xl font-bold text-yellow-300">{stats.drafts}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.7)] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.6)]">Planlı</p>
          <p className="mt-2 text-2xl font-bold text-[rgba(130,226,255,0.95)]">{stats.scheduled}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.65)] p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(255,255,255,0.45)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Başlık, özet veya içerik ara..."
            className="w-full rounded-xl border border-[rgba(72,213,255,0.2)] bg-[rgba(12,26,36,0.85)] px-10 py-3 text-sm text-white outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.75)]">
          <Filter className="h-4 w-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Blog["status"] | "all")}
            className="rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(12,26,36,0.85)] px-3 py-2 text-sm text-white outline-none"
          >
            <option value="all">Tüm durumlar</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
            <option value="scheduled">Planlı</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
            className="rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(12,26,36,0.85)] px-3 py-2 text-sm text-white outline-none"
          >
            <option value="all">Tüm kategoriler</option>
            {categories.map((cat) => (
              <option key={cat.slug ?? cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openComposer()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(72,213,255,0.9)] to-[rgba(0,167,197,0.9)] px-4 py-2 text-sm font-semibold text-black shadow-[0_18px_45px_rgba(0,167,197,0.35)]"
        >
          <FilePlus className="h-4 w-4" />
          Yeni Yazı
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[rgba(72,213,255,0.15)] bg-[rgba(8,18,26,0.75)] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[2fr_1fr_1fr_120px] border-b border-[rgba(255,255,255,0.08)] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[rgba(255,255,255,0.55)]">
          <span>Başlık</span>
          <span>Durum</span>
          <span>Yayın</span>
          <span className="text-right">Aksiyon</span>
        </div>
        <div className="divide-y divide-[rgba(255,255,255,0.05)]">
          {filtered.map((blog) => (
            <div key={blog.id} className="grid grid-cols-[2fr_1fr_1fr_120px] items-center px-4 py-3 text-sm text-white">
              <div className="space-y-1">
                <p className="font-semibold">{blog.title}</p>
                <p className="text-[12px] text-[rgba(255,255,255,0.6)] line-clamp-1">{blog.excerpt}</p>
              </div>
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.15em]",
                  blog.status === "published"
                    ? "bg-green-500/15 text-green-300"
                    : blog.status === "scheduled"
                    ? "bg-yellow-500/15 text-yellow-300"
                    : "bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.65)]"
                )}
              >
                <CalendarClock className="h-4 w-4" />
                {blog.status ?? "draft"}
              </span>
              <span className="text-[rgba(255,255,255,0.7)]">{formatDate(blog.publishAt ?? blog.date)}</span>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openComposer(blog)}
                  className="rounded-full border border-[rgba(255,255,255,0.2)] px-3 py-1 text-xs text-[rgba(255,255,255,0.75)] hover:border-[rgba(255,255,255,0.35)]"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <Link
                  href={`/blogs/${blog.id}`}
                  className="rounded-full border border-[rgba(72,213,255,0.25)] px-3 py-1 text-xs text-[rgba(130,226,255,0.95)] hover:border-[rgba(72,213,255,0.4)]"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-[rgba(255,255,255,0.6)]">Kayıt bulunamadı.</div>
          )}
        </div>
      </div>

      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[rgba(72,213,255,0.25)] bg-[rgba(6,16,24,0.95)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <DraftForm
              draft={draft}
              onChange={setDraft}
              onSave={handleSave}
              onClose={() => setComposerOpen(false)}
              saving={saving}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
