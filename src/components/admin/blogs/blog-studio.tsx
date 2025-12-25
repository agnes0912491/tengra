"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { CalendarClock, Edit3, Eye, FilePlus, Filter, Search, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTranslation } from "@tengra/language";

import type { Blog, BlogCategory } from "@/types/blog";
import { getAllBlogCategories } from "@/lib/db";
import { cn } from "@/lib/utils";
import { AdminCard, AdminBadge } from "@/components/admin/ui";

type BlogStudioProps = {
  initialBlogs: Blog[];
};

const formatDate = (value?: string, locale?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale ?? "tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function BlogStudio({ initialBlogs }: BlogStudioProps) {
  const { language: locale } = useTranslation();
  const { t } = useTranslation("AdminBlogs");
  const [blogs] = useState<Blog[]>(initialBlogs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Blog["status"] | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
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

  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === "published").length;
    const drafts = blogs.filter((b) => b.status === "draft").length;
    const scheduled = blogs.filter((b) => b.status === "scheduled").length;
    return { total, published, drafts, scheduled };
  }, [blogs]);



  const chartData = useMemo(() => {
    return blogs
      .slice(0, 10)
      .map(b => ({
        name: b.title.length > 20 ? b.title.slice(0, 20) + "..." : b.title,
        views: b.metrics?.views || 0,
        likes: b.metrics?.likes || 0
      }))
      .sort((a, b) => b.views - a.views);
  }, [blogs]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Analytics Chart */}
        <AdminCard variant="default" padding="lg" className="col-span-2">
          <h3 className="mb-6 text-lg font-semibold text-white">{t("studio.topPosts")}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#08121a", borderColor: "rgba(72,213,255,0.2)", color: "#fff" }}
                  itemStyle={{ color: "#48d5ff" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#48d5ff" : "rgba(72,213,255,0.6)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <AdminCard variant="elevated" padding="md">
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">{t("studio.stats.total")}</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.total}</p>
        </AdminCard>
        <AdminCard variant="elevated" padding="md">
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">{t("status.published")}</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{stats.published}</p>
        </AdminCard>
        <AdminCard variant="elevated" padding="md">
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">{t("status.draft")}</p>
          <p className="mt-2 text-2xl font-bold text-amber-300">{stats.drafts}</p>
        </AdminCard>
        <AdminCard variant="elevated" padding="md">
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">{t("status.scheduled")}</p>
          <p className="mt-2 text-2xl font-bold text-[rgba(130,226,255,0.95)]">{stats.scheduled}</p>
        </AdminCard>
      </div>

      {/* Filters & Actions */}
      <AdminCard variant="default" padding="md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(255,255,255,0.4)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("studio.searchPlaceholder")}
              className="w-full rounded-xl border border-[rgba(72,213,255,0.15)] bg-[rgba(8,18,26,0.8)] px-10 py-2.5 text-sm text-white outline-none focus:border-[rgba(72,213,255,0.3)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.7)]">
            <Filter className="h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Blog["status"] | "all")}
              className="rounded-lg border border-[rgba(72,213,255,0.15)] bg-[rgba(8,18,26,0.8)] px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">{t("studio.statusAll")}</option>
              <option value="published">{t("status.published")}</option>
              <option value="draft">{t("status.draft")}</option>
              <option value="scheduled">{t("status.scheduled")}</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-[rgba(72,213,255,0.15)] bg-[rgba(8,18,26,0.8)] px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">{t("studio.categoryAll")}</option>
              {categories.map((cat) => (
                <option key={cat.slug ?? cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/admin/dashboard/blogs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[rgba(72,213,255,0.9)] to-[rgba(0,167,197,0.9)] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_4px_20px_rgba(0,167,197,0.3)] hover:brightness-110 transition-all"
          >
          <FilePlus className="h-4 w-4" />
          {t("studio.newPost")}
        </Link>
        </div>
      </AdminCard>

      {/* Blog List */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                  {t("studio.table.title")}
                </th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                  {t("studio.table.status")}
                </th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                  {t("studio.table.publishDate")}
                </th>
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                  {t("studio.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {filtered.map((blog) => (
                <tr
                  key={blog.id}
                  className="text-[rgba(255,255,255,0.85)] hover:bg-[rgba(72,213,255,0.04)] transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      <p className="font-medium text-white">{blog.title}</p>
                      <p className="text-xs text-[rgba(255,255,255,0.5)] line-clamp-1">
                        {blog.excerpt}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminBadge
                      variant={
                        blog.status === "published"
                          ? "success"
                          : blog.status === "scheduled"
                            ? "warning"
                            : "default"
                      }
                      size="md"
                    >
                      <CalendarClock className="h-3 w-3" />
                      {blog.status === "published"
                        ? t("status.published")
                        : blog.status === "scheduled"
                          ? t("status.scheduled")
                          : t("status.draft")}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-3.5 text-[rgba(255,255,255,0.6)]">
                    {formatDate(blog.publishAt ?? blog.date, locale)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/dashboard/blogs/${blog.id}/edit`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-all"
                        title={t("studio.table.edit")}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/blogs/${blog.slug ?? blog.id}`}
                        target="_blank"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-[rgba(72,213,255,0.2)] text-[rgba(130,226,255,0.8)] hover:bg-[rgba(72,213,255,0.1)] transition-all"
                        title={t("studio.table.view")}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[rgba(255,255,255,0.5)]">
                    {t("studio.table.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
