"use client";

import { useEffect, useMemo, useState } from "react";
import { adminCreateCategory, adminFetchForumCategories, adminUpdateCategory, AdminCategoryInput } from "@/lib/forum";
import { ForumCategory } from "@/types/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "react-toastify";

type Props = {
  token: string;
  initialCategories: ForumCategory[];
};

export default function ForumAdmin({ token, initialCategories }: Props) {
  const [categories, setCategories] = useState<ForumCategory[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<AdminCategoryInput & { name: string }>({
    name: "",
    description: "",
    sortOrder: (initialCategories.length + 1) * 10,
    isHidden: false,
    isLocked: false,
  });

  const sorted = useMemo(
    () => categories.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)),
    [categories]
  );

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await adminFetchForumCategories(token);
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("Forum kategorileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const updateCategory = async (id: number, input: AdminCategoryInput) => {
    setLoading(true);
    try {
      const data = await adminUpdateCategory(id, input, token);
      setCategories(data);
      toast.success("Kategori güncellendi.");
    } catch (err) {
      console.error(err);
      toast.error("Kategori güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!draft.name.trim()) {
      toast.error("Kategori adı gerekli.");
      return;
    }
    setCreating(true);
    try {
      const data = await adminCreateCategory(draft, token);
      setCategories(data);
      toast.success("Kategori oluşturuldu.");
      setDraft({
        name: "",
        description: "",
        sortOrder: (data.length + 1) * 10,
        isHidden: false,
        isLocked: false,
      });
    } catch (err) {
      console.error(err);
      toast.error("Kategori oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Forum Kategorileri</h2>
        <Button onClick={refresh} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yenile"}
        </Button>
      </div>

      <div className="rounded-2xl border border-[rgba(72,213,255,0.12)] bg-[rgba(15,31,54,0.6)] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Kategori
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Ad"
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            placeholder="Slug (opsiyonel)"
            value={draft.slug ?? ""}
            onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
          />
          <Input
            placeholder="Açıklama"
            value={draft.description ?? ""}
            onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
          />
          <Input
            placeholder="Simge (lucide id)"
            value={draft.icon ?? ""}
            onChange={(e) => setDraft((p) => ({ ...p, icon: e.target.value }))}
          />
          <Input
            placeholder="Renk etiketi"
            value={draft.color ?? ""}
            onChange={(e) => setDraft((p) => ({ ...p, color: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Sıra"
            value={draft.sortOrder ?? 0}
            onChange={(e) => setDraft((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
          />
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--color-turkish-blue-400)]"
              checked={draft.isHidden ?? false}
              onChange={(e) => setDraft((p) => ({ ...p, isHidden: e.target.checked }))}
            />
            Gizli
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--color-turkish-blue-400)]"
              checked={draft.isLocked ?? false}
              onChange={(e) => setDraft((p) => ({ ...p, isLocked: e.target.checked }))}
            />
            Kilitli
          </label>
        </div>
        <Button onClick={createCategory} disabled={creating}>
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="ml-2">Kaydet</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[rgba(72,213,255,0.12)] bg-[rgba(15,31,54,0.6)]">
        <table className="min-w-full divide-y divide-[rgba(72,213,255,0.1)] text-sm">
          <thead className="bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left">Ad</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Sıra</th>
              <th className="px-4 py-3 text-left">Gizli</th>
              <th className="px-4 py-3 text-left">Kilitli</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(72,213,255,0.08)]">
            {sorted.map((cat) => (
              <tr key={cat.id}>
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                  <Input
                    defaultValue={cat.name}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== cat.name) updateCategory(cat.id, { name: v });
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  <Input
                    defaultValue={cat.slug}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== cat.slug) updateCategory(cat.id, { slug: v });
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    defaultValue={cat.sortOrder ?? 0}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!Number.isNaN(v) && v !== cat.sortOrder) updateCategory(cat.id, { sortOrder: v });
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-turkish-blue-400)]"
                    checked={!!cat.isHidden}
                    onChange={(e) => updateCategory(cat.id, { isHidden: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--color-turkish-blue-400)]"
                    checked={!!cat.isLocked}
                    onChange={(e) => updateCategory(cat.id, { isLocked: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-3 text-right text-[var(--text-muted)] text-xs">
                  {cat.threadCount ?? 0} konu · {cat.postCount ?? 0} mesaj
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="p-6 text-center text-[var(--text-muted)] text-sm">Henüz kategori yok.</div>
        )}
      </div>
    </div>
  );
}
