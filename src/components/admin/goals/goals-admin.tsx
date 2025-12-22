"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Dialog from "@radix-ui/react-dialog";
import {
    GripVertical,
    Trash2,
    Plus,
    Save,
    X,
    Target,
    Languages,
    Search,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    RotateCcw,
    FileText,
    Crosshair,
    TrendingUp,
    Award,
} from "lucide-react";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Goal = { title: string; body: string; order: number; isActive: boolean };
type TargetsShape = Goal[] | Record<string, Goal[]>;
type HomepagePayload = { targets?: TargetsShape; faqs?: unknown };

const SUPPORTED_LOCALES = routing.locales;

const LOCALE_LABELS: Record<string, { labelKey: string; flag: string }> = {
    tr: { labelKey: "localeLabels.tr", flag: "TR" },
    en: { labelKey: "localeLabels.en", flag: "US" },
    de: { labelKey: "localeLabels.de", flag: "DE" },
    fr: { labelKey: "localeLabels.fr", flag: "FR" },
    es: { labelKey: "localeLabels.es", flag: "ES" },
    ru: { labelKey: "localeLabels.ru", flag: "RU" },
    zh: { labelKey: "localeLabels.zh", flag: "CN" },
    ja: { labelKey: "localeLabels.ja", flag: "JP" },
    ko: { labelKey: "localeLabels.ko", flag: "KR" },
    ar: { labelKey: "localeLabels.ar", flag: "SA" },
};

export default function GoalsAdmin() {
    const t = useTranslations("AdminContent");
    const [locale, setLocale] = useState<(typeof SUPPORTED_LOCALES)[number]>("tr");
    const [items, setItems] = useState<Goal[]>([]);
    const [originalItems, setOriginalItems] = useState<Goal[]>([]);
    const [raw, setRaw] = useState<HomepagePayload>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [discardConfirm, setDiscardConfirm] = useState(false);

    const extractForLocale = (targets: TargetsShape | undefined, loc: string): Goal[] => {
        if (!targets) return [];
        if (Array.isArray(targets)) return targets as Goal[];
        const map = targets as Record<string, Goal[]>;
        const list = map[loc] ?? [];
        return Array.isArray(list) ? list : [];
    };

    const assignForLocale = (targets: TargetsShape | undefined, loc: string, list: Goal[]): TargetsShape => {
        if (!targets) return { [loc]: list } as Record<string, Goal[]>;
        if (Array.isArray(targets)) {
            return { [loc]: list } as Record<string, Goal[]>;
        }
        const next = { ...(targets as Record<string, Goal[]>) };
        next[loc] = list;
        return next;
    };

    const reindex = (list: Goal[]) => list.map((it, i) => ({ ...it, order: i }));

    // Load initial homepage content
    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/admin/homepage", { cache: "no-store" });
                const json = (await res.json().catch(() => ({}))) as HomepagePayload;
                if (!active) return;
                setRaw(json ?? {});
                const extracted = extractForLocale(json?.targets, locale);
                setItems(extracted.map((g) => ({ ...g })));
                setOriginalItems(extracted.map((g) => ({ ...g })));
            } catch (e) {
                if (!active) return;
                setError(String(e));
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When locale changes, refresh list from raw
    useEffect(() => {
        const extracted = extractForLocale(raw?.targets, locale);
        setItems(extracted.map((g) => ({ ...g })));
        setOriginalItems(extracted.map((g) => ({ ...g })));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]);

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(
            (item) => item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q)
        );
    }, [items, searchQuery]);

    const stats = useMemo(() => {
        const total = items.length;
        const active = items.filter((i) => i.isActive).length;
        const inactive = total - active;
        return { total, active, inactive };
    }, [items]);

    const isDirty = useMemo(() => {
        if (items.length !== originalItems.length) return true;
        return items.some((item, i) => {
            const orig = originalItems[i];
            return (
                item.title !== orig?.title ||
                item.body !== orig?.body ||
                item.isActive !== orig?.isActive ||
                item.order !== orig?.order
            );
        });
    }, [items, originalItems]);

    const addNew = () => {
        const newGoal: Goal = {
            title: t("newGoalTitle"),
            body: t("newGoalBody"),
            order: items.length,
            isActive: true,
        };
        setItems((prev) => [...prev, newGoal]);
        setExpandedIndex(items.length);
        setSuccess(t("goals.toast.added"));
        setTimeout(() => setSuccess(null), 3000);
    };

    const saveAll = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const nextTargets = assignForLocale(raw?.targets, locale, reindex(items));
            const payload: HomepagePayload = { ...raw, targets: nextTargets };
            const res = await fetch("/api/admin/homepage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`${res.status} ${txt}`);
            }
            setRaw(payload);
            setOriginalItems(items.map((g) => ({ ...g })));
            setSuccess(t("goals.toast.savedAll"));
            setTimeout(() => setSuccess(null), 3000);
            // notify live sections
            try {
                window.dispatchEvent(new CustomEvent("content:published", { detail: { payload } }));
            } catch { }
        } catch (e) {
            setError(String(e));
        } finally {
            setSaving(false);
        }
    };

    const removeAt = (idx: number) => {
        setItems((prev) => reindex(prev.filter((_, i) => i !== idx)));
        setDeleteConfirm(null);
        setSuccess(t("goals.toast.deleted"));
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleReorder = useCallback((newOrder: Goal[]) => {
        setItems(reindex(newOrder));
    }, []);

    const updateItem = (idx: number, field: keyof Goal, value: string | boolean) => {
        setItems((prev) =>
            prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
        );
    };

    const discardChanges = () => {
        setItems(originalItems.map((g) => ({ ...g })));
        setDiscardConfirm(false);
        setSuccess(t("goals.toast.discarded"));
        setTimeout(() => setSuccess(null), 3000);
    };

    return (
        <>
            <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: t("goals.stats.total"), value: stats.total, icon: Target, color: "from-blue-500 to-cyan-500" },
                        { label: t("goals.stats.active"), value: stats.active, icon: TrendingUp, color: "from-emerald-500 to-green-500" },
                        { label: t("goals.stats.inactive"), value: stats.inactive, icon: EyeOff, color: "from-gray-500 to-slate-500" },
                        { label: t("goals.stats.status"), value: isDirty ? t("goals.stats.changed") : t("goals.stats.upToDate"), icon: Award, color: isDirty ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-500", isText: true },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className={`font-bold text-white ${(stat as { isText?: boolean }).isText ? "text-lg" : "text-2xl"}`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] backdrop-blur-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[rgba(72,213,255,0.1)]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Language & Search */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                {/* Language Selector */}
                                <div className="relative">
                                    <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                                    <select
                                        value={locale}
                                        onChange={(e) => setLocale(e.target.value as typeof locale)}
                                        className="pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(15,31,54,0.8)] border border-[rgba(72,213,255,0.2)] text-white text-sm appearance-none cursor-pointer hover:border-[rgba(72,213,255,0.4)] transition-colors min-w-[160px]"
                                    >
                                        {(SUPPORTED_LOCALES as readonly string[]).map((loc) => {
                                            const localeMeta = LOCALE_LABELS[loc];
                                            const label = localeMeta?.labelKey ? t(localeMeta.labelKey) : loc.toUpperCase();
                                            return (
                                                <option key={loc} value={loc}>
                                                    [{localeMeta?.flag || "??"}] {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* Search */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                        placeholder={t("goals.searchPlaceholder")}
                                        className="pl-10 bg-[rgba(15,31,54,0.8)] border-[rgba(72,213,255,0.2)]"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                                {isDirty && (
                                    <>
                                        <Button
                                            onClick={saveAll}
                                            disabled={saving}
                                            size="sm"
                                            className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                        >
                                            {saving ? (
                                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-1" />
                                            )}
                                            {t("save")}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDiscardConfirm(true)}
                                            className="border-[rgba(72,213,255,0.2)] hover:bg-[rgba(72,213,255,0.1)]"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-1" />
                                            {t("cancel")}
                                        </Button>
                                    </>
                                )}
                                <Button
                                    onClick={addNew}
                                    size="sm"
                                    className="bg-[var(--color-turkish-blue-500)] hover:bg-[var(--color-turkish-blue-600)] text-white"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    {t("goals.actions.addNew")}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    <AnimatePresence>
                        {(error || success) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`px-6 py-3 flex items-center gap-2 text-sm ${error ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                                    }`}
                            >
                                {error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                {error || success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <RefreshCw className="w-8 h-8 text-[var(--color-turkish-blue-400)] animate-spin" />
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-16">
                                <Crosshair className="w-16 h-16 mx-auto text-[var(--text-muted)] opacity-50 mb-4" />
                                <p className="text-[var(--text-secondary)]">
                                    {searchQuery ? t("goals.empty.filtered") : t("goals.empty.default")}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={addNew} className="mt-4" variant="outline">
                                        <Plus className="w-4 h-4 mr-1" />
                                        {t("goals.actions.addFirst")}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Reorder.Group axis="y" values={filteredItems} onReorder={handleReorder} className="space-y-3">
                                {filteredItems.map((item, index) => {
                                    const realIndex = items.findIndex(
                                        (i) => i.title === item.title && i.body === item.body && i.order === item.order
                                    );
                                    return (
                                        <Reorder.Item key={`${item.order}-${item.title}`} value={item} className="list-none">
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`relative rounded-xl border transition-all duration-200 ${expandedIndex === realIndex
                                                        ? "bg-[rgba(30,184,255,0.05)] border-[rgba(72,213,255,0.3)]"
                                                        : "bg-[rgba(15,31,54,0.4)] border-[rgba(72,213,255,0.1)] hover:border-[rgba(72,213,255,0.2)]"
                                                    }`}
                                            >
                                                {/* Header Row */}
                                                <div
                                                    className="flex items-center gap-3 p-4 cursor-pointer"
                                                    onClick={() => setExpandedIndex(expandedIndex === realIndex ? null : realIndex)}
                                                >
                                                    {/* Drag Handle */}
                                                    <div className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] transition-colors">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>

                                                    {/* Order Badge */}
                                                    <div className="w-8 h-8 rounded-lg bg-[rgba(30,184,255,0.1)] border border-[rgba(72,213,255,0.2)] flex items-center justify-center text-sm font-semibold text-[var(--color-turkish-blue-400)]">
                                                        {index + 1}
                                                    </div>

                                                    {/* Goal Preview */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">{item.title}</p>
                                                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                                            {item.body.substring(0, 80)}...
                                                        </p>
                                                    </div>

                                                    {/* Status & Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateItem(realIndex, "isActive", !item.isActive);
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors ${item.isActive
                                                                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                                                    : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                                                                }`}
                                                            title={item.isActive ? t("goals.status.active") : t("goals.status.inactive")}
                                                        >
                                                            {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteConfirm(realIndex);
                                                            }}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                            title={t("delete")}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                <AnimatePresence>
                                                    {expandedIndex === realIndex && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 pb-4 pt-2 space-y-4 border-t border-[rgba(72,213,255,0.1)]">
                                                                {/* Title Input */}
                                                                <div className="space-y-2">
                                                                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                                                        <Target className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                                                                        {t("title")}
                                                                    </label>
                                                                    <Input
                                                                        value={item.title}
                                                                        onChange={(e) => updateItem(realIndex, "title", e.currentTarget.value)}
                                                                        className="bg-[rgba(15,31,54,0.8)] border-[rgba(72,213,255,0.2)]"
                                                                    />
                                                                </div>

                                                                {/* Body Textarea */}
                                                                <div className="space-y-2">
                                                                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                                                        <FileText className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                                                                        {t("body")}
                                                                    </label>
                                                                    <textarea
                                                                        value={item.body}
                                                                        onChange={(e) => updateItem(realIndex, "body", e.currentTarget.value)}
                                                                        rows={4}
                                                                        className="w-full px-4 py-3 rounded-xl text-base md:text-sm bg-[rgba(15,31,54,0.8)] border border-[rgba(72,213,255,0.2)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] backdrop-blur-sm transition-all duration-200 focus:border-[var(--color-turkish-blue-500)] focus:ring-2 focus:ring-[rgba(30,184,255,0.2)] focus:outline-none resize-none"
                                                                    />
                                                                </div>

                                                                {/* Close Button */}
                                                                <div className="flex items-center gap-2 pt-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setExpandedIndex(null)}
                                                                    >
                                                                        <X className="w-4 h-4 mr-1" />
                                                                        {t("goals.actions.close")}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog.Root open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl bg-[rgba(15,31,54,0.95)] border border-[rgba(72,213,255,0.2)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] z-50">
                        <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-400" />
                            {t("goals.dialogs.delete.title")}
                        </Dialog.Title>
                        <Dialog.Description className="mt-3 text-sm text-[var(--text-secondary)]">
                            {t("goals.dialogs.delete.description")}
                        </Dialog.Description>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                                {t("cancel")}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteConfirm !== null && removeAt(deleteConfirm)}
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {t("delete")}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Discard Changes Dialog */}
            <Dialog.Root open={discardConfirm} onOpenChange={setDiscardConfirm}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl bg-[rgba(15,31,54,0.95)] border border-[rgba(72,213,255,0.2)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] z-50">
                        <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-amber-400" />
                            {t("goals.dialogs.discard.title")}
                        </Dialog.Title>
                        <Dialog.Description className="mt-3 text-sm text-[var(--text-secondary)]">
                            {t("goals.dialogs.discard.description")}
                        </Dialog.Description>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDiscardConfirm(false)}>
                                {t("goals.dialogs.discard.cancel")}
                            </Button>
                            <Button variant="destructive" onClick={discardChanges}>
                                <RotateCcw className="w-4 h-4 mr-1" />
                                {t("goals.dialogs.discard.confirm")}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
