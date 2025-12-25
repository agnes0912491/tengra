"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Dialog from "@radix-ui/react-dialog";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";
import { createFaq, deleteFaq, getFaqs, updateFaq, type FaqItem } from "@/lib/db";
import { routing } from "@/i18n/routing";
import {
    GripVertical,
    Trash2,
    Plus,
    Save,
    X,
    HelpCircle,
    Languages,
    Search,
    FileQuestion,
    MessageSquareText,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    RotateCcw,
} from "lucide-react";
import { useTranslation } from "@tengra/language";

import { MarkdownEditor } from "@/components/ui/markdown-editor";

const SUPPORTED_LOCALES = routing.locales;

const LOCALE_LABELS: Record<string, { labelKey: string; flag: string }> = {
    tr: { labelKey: "localeLabels.tr", flag: "🇹🇷" },
    en: { labelKey: "localeLabels.en", flag: "🇺🇸" },
    de: { labelKey: "localeLabels.de", flag: "🇩🇪" },
    fr: { labelKey: "localeLabels.fr", flag: "🇫🇷" },
    es: { labelKey: "localeLabels.es", flag: "🇪🇸" },
    ru: { labelKey: "localeLabels.ru", flag: "🇷🇺" },
    zh: { labelKey: "localeLabels.zh", flag: "🇨🇳" },
    ja: { labelKey: "localeLabels.ja", flag: "🇯🇵" },
    ko: { labelKey: "localeLabels.ko", flag: "🇰🇷" },
    ar: { labelKey: "localeLabels.ar", flag: "🇸🇦" },
};

export default function FaqAdmin() {
    const { t } = useTranslation("AdminContent");
    const [locale, setLocale] = useState<(typeof SUPPORTED_LOCALES)[number]>("tr");
    const [items, setItems] = useState<FaqItem[]>([]);
    const [drafts, setDrafts] = useState<FaqItem[]>([]);
    const [dirty, setDirty] = useState<Set<string>>(new Set());
    const [orderDirty, setOrderDirty] = useState(false);
    const [savingAll, setSavingAll] = useState(false);
    const [openConfirmAll, setOpenConfirmAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const token = useMemo(
        () => ADMIN_SESSION_COOKIE_CANDIDATES.map((n) => Cookies.get(n)).find(Boolean) || "",
        []
    );

    const load = async (loc: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const list = await getFaqs(loc);
            const cloned = list.map((i) => ({ ...i }));
            setItems(cloned);
            setDrafts(cloned.map((i) => ({ ...i })));
            setDirty(new Set());
            setOrderDirty(false);
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(locale);
    }, [locale]);

    const filteredDrafts = useMemo(() => {
        if (!searchQuery.trim()) return drafts;
        const q = searchQuery.toLowerCase();
        return drafts.filter(
            (item) =>
                item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
        );
    }, [drafts, searchQuery]);

    const stats = useMemo(() => {
        const total = items.length;
        const active = items.filter((i) => i.isActive).length;
        const inactive = total - active;
        const modified = dirty.size;
        return { total, active, inactive, modified };
    }, [items, dirty]);

    const addNew = async () => {
        if (!token) return;
        const created = await createFaq(
            {
                locale,
                question: t("newFaqQuestion"),
                answer: t("newFaqAnswer"),
                order: items.length,
                isActive: true,
            },
            token
        );
        if (created) {
            setItems((prev) => [...prev, { ...created }]);
            setDrafts((prev) => [...prev, { ...created }]);
            setExpandedId(created.id);
            setSuccess(t("faq.toast.added"));
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const saveItem = useCallback(
        async (id: string, patch: Partial<FaqItem>) => {
            if (!token) return;
            const updated = await updateFaq(id, patch, token);
            if (updated) {
                setItems((prev) => prev.map((i) => (i.id === id ? { ...updated } : i)));
                setDrafts((prev) => prev.map((i) => (i.id === id ? { ...updated } : i)));
                setDirty((prev) => {
                    const s = new Set(prev);
                    s.delete(id);
                    return s;
                });
                setSuccess(t("faq.toast.saved"));
                setTimeout(() => setSuccess(null), 3000);
            }
        },
        [token]
    );

    const removeItem = async (id: string) => {
        if (!token) return;
        const ok = await deleteFaq(id, token);
        if (ok) {
            setItems((prev) => prev.filter((i) => i.id !== id));
            setDrafts((prev) => prev.filter((i) => i.id !== id));
            setDirty((prev) => {
                const s = new Set(prev);
                s.delete(id);
                return s;
            });
            setDeleteConfirm(null);
            setSuccess(t("faq.toast.deleted"));
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const handleReorder = (newOrder: FaqItem[]) => {
        const reordered = newOrder.map((item, index) => ({ ...item, order: index }));
        setDrafts(reordered);
        setOrderDirty(true);
    };

    const saveOrder = async () => {
        if (!token) return;
        const updates: Array<Promise<unknown>> = [];
        drafts.forEach((it, idx) => {
            if (items[idx]?.id !== it.id || items[idx]?.order !== it.order) {
                updates.push(updateFaq(it.id, { order: it.order }, token));
            }
        });
        await Promise.all(updates);
        setItems(drafts.map((i) => ({ ...i })));
        setOrderDirty(false);
        setSuccess(t("faq.toast.orderSaved"));
        setTimeout(() => setSuccess(null), 3000);
    };

    const saveAll = async () => {
        setSavingAll(true);
        setError(null);
        try {
            const ops: Array<Promise<unknown>> = [];
            drafts.forEach((d) => {
                if (dirty.has(d.id)) {
                    ops.push(updateFaq(d.id, { question: d.question, answer: d.answer, isActive: d.isActive }, token));
                }
            });
            await Promise.all(ops);
            setItems(drafts.map((i) => ({ ...i })));
            setDirty(new Set());
            setSuccess(t("faq.toast.savedAll"));
            setTimeout(() => setSuccess(null), 3000);
        } catch (e) {
            setError(String(e));
        } finally {
            setSavingAll(false);
        }
    };

    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const setDraftField = (id: string, field: keyof FaqItem, value: string | boolean) => {
        setDrafts((prev) => {
            let changed = false;
            const next = prev.map((i) => {
                if (i.id !== id) return i;
                if (i[field] === (value as unknown as FaqItem[typeof field])) {
                    return i;
                }
                changed = true;
                return { ...i, [field]: value };
            });
            return changed ? next : prev;
        });

        const original = items.find((i) => i.id === id);
        const isDirtyNow = !original || original[field] !== (value as unknown as FaqItem[typeof field]);

        setDirty((prev) => {
            const s = new Set(prev);
            if (isDirtyNow) {
                s.add(id);
            } else {
                s.delete(id);
            }
            return s;
        });

        if (timers.current[id]) clearTimeout(timers.current[id]);
        timers.current[id] = setTimeout(() => { }, 250);
    };

    const resetDraft = (id: string) => {
        const original = items.find((i) => i.id === id);
        if (original) {
            setDrafts((prev) => prev.map((d) => (d.id === id ? { ...original } : d)));
            setDirty((prev) => {
                const s = new Set(prev);
                s.delete(id);
                return s;
            });
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: t("faq.stats.total"), value: stats.total, icon: HelpCircle, color: "from-blue-500 to-cyan-500" },
                        { label: t("faq.stats.active"), value: stats.active, icon: Eye, color: "from-emerald-500 to-green-500" },
                        { label: t("faq.stats.inactive"), value: stats.inactive, icon: EyeOff, color: "from-gray-500 to-slate-500" },
                        { label: t("faq.stats.modified"), value: stats.modified, icon: RefreshCw, color: "from-amber-500 to-orange-500" },
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
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
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
                                                    {localeMeta?.flag || "🌐"} {label}
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
                                        placeholder={t("faq.searchPlaceholder")}
                                        className="pl-10 bg-[rgba(15,31,54,0.8)] border-[rgba(72,213,255,0.2)]"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                                {orderDirty && (
                                    <Button
                                        onClick={saveOrder}
                                        size="sm"
                                        className="bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                                    >
                                        <Save className="w-4 h-4 mr-1" />
                                        {t("faq.actions.saveOrder")}
                                    </Button>
                                )}
                                {dirty.size > 0 && (
                                    <>
                                        <Button
                                            onClick={saveAll}
                                            disabled={savingAll}
                                            size="sm"
                                            className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                        >
                                            {savingAll ? (
                                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-1" />
                                            )}
                                            {t("faq.actions.saveAll", { count: dirty.size })}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setOpenConfirmAll(true)}
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
                                    {t("faq.actions.addNew")}
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
                        ) : filteredDrafts.length === 0 ? (
                            <div className="text-center py-16">
                                <FileQuestion className="w-16 h-16 mx-auto text-[var(--text-muted)] opacity-50 mb-4" />
                                <p className="text-[var(--text-secondary)]">
                                    {searchQuery ? t("faq.empty.filtered") : t("faq.empty.default")}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={addNew} className="mt-4" variant="outline">
                                        <Plus className="w-4 h-4 mr-1" />
                                        {t("faq.actions.addFirst")}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Reorder.Group axis="y" values={filteredDrafts} onReorder={handleReorder} className="space-y-3">
                                {filteredDrafts.map((item, index) => (
                                    <Reorder.Item key={item.id} value={item} className="list-none">
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`relative rounded-xl border transition-all duration-200 ${expandedId === item.id
                                                ? "bg-[rgba(30,184,255,0.05)] border-[rgba(72,213,255,0.3)]"
                                                : "bg-[rgba(15,31,54,0.4)] border-[rgba(72,213,255,0.1)] hover:border-[rgba(72,213,255,0.2)]"
                                                } ${dirty.has(item.id) ? "ring-2 ring-amber-500/30" : ""}`}
                                        >
                                            {/* Header Row */}
                                            <div
                                                className="flex items-center gap-3 p-4 cursor-pointer"
                                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                            >
                                                {/* Drag Handle */}
                                                <div className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] transition-colors">
                                                    <GripVertical className="w-5 h-5" />
                                                </div>

                                                {/* Order Badge */}
                                                <div className="w-8 h-8 rounded-lg bg-[rgba(30,184,255,0.1)] border border-[rgba(72,213,255,0.2)] flex items-center justify-center text-sm font-semibold text-[var(--color-turkish-blue-400)]">
                                                    {index + 1}
                                                </div>

                                                {/* Question Preview */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{item.question}</p>
                                                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                                        {item.answer.substring(0, 80)}...
                                                    </p>
                                                </div>

                                                {/* Status & Actions */}
                                                <div className="flex items-center gap-2">
                                                    {dirty.has(item.id) && (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">
                                                            {t("faq.badges.edited")}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDraftField(item.id, "isActive", !item.isActive);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${item.isActive
                                                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                                            : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                                                            }`}
                                                        title={item.isActive ? t("faq.status.active") : t("faq.status.inactive")}
                                                    >
                                                        {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteConfirm(item.id);
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
                                                {expandedId === item.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-[rgba(72,213,255,0.1)]">
                                                            {/* Question Input */}
                                                            <div className="space-y-2">
                                                            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                                                <FileQuestion className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                                                                {t("question")}
                                                            </label>
                                                            <Input
                                                                value={item.question}
                                                                onChange={(e) => setDraftField(item.id, "question", e.currentTarget.value)}
                                                                    className="bg-[rgba(15,31,54,0.8)] border-[rgba(72,213,255,0.2)]"
                                                                />
                                                            </div>

                                                            {/* Answer Editor */}
                                                            <div className="space-y-2">
                                                            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                                                                <MessageSquareText className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                                                                {t("faq.fields.answerMarkdown")}
                                                            </label>
                                                            <div data-color-mode="dark" className="rounded-xl overflow-hidden border border-[rgba(72,213,255,0.2)]">
                                                                <MarkdownEditor
                                                                    value={item.answer}
                                                                    onChange={(v: string = "") => setDraftField(item.id, "answer", v)}
                                                                        height={200}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            {dirty.has(item.id) && (
                                                                <div className="flex items-center gap-2 pt-2">
                                                                    <Button
                                                                        onClick={() => saveItem(item.id, { question: item.question, answer: item.answer, isActive: item.isActive })}
                                                                        size="sm"
                                                                        className="bg-[var(--color-turkish-blue-500)] hover:bg-[var(--color-turkish-blue-600)]"
                                                                    >
                                                                        <Save className="w-4 h-4 mr-1" />
                                                                        {t("save")}
                                                                    </Button>
                                                                    <Button variant="outline" size="sm" onClick={() => resetDraft(item.id)}>
                                                                        <X className="w-4 h-4 mr-1" />
                                                                        {t("cancel")}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog.Root open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl bg-[rgba(15,31,54,0.95)] border border-[rgba(72,213,255,0.2)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] z-50">
                        <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-400" />
                            {t("faq.dialogs.delete.title")}
                        </Dialog.Title>
                        <Dialog.Description className="mt-3 text-sm text-[var(--text-secondary)]">
                            {t("faq.dialogs.delete.description")}
                        </Dialog.Description>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                                {t("cancel")}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteConfirm && removeItem(deleteConfirm)}
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {t("delete")}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Discard All Changes Dialog */}
            <Dialog.Root open={openConfirmAll} onOpenChange={setOpenConfirmAll}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl bg-[rgba(15,31,54,0.95)] border border-[rgba(72,213,255,0.2)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] z-50">
                        <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-amber-400" />
                            {t("faq.dialogs.discard.title")}
                        </Dialog.Title>
                        <Dialog.Description className="mt-3 text-sm text-[var(--text-secondary)]">
                            {t("faq.dialogs.discard.description", { count: dirty.size })}
                        </Dialog.Description>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setOpenConfirmAll(false)}>
                                {t("faq.dialogs.discard.cancel")}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setDrafts(items.map((i) => ({ ...i })));
                                    setDirty(new Set());
                                    setOpenConfirmAll(false);
                                }}
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                {t("faq.dialogs.discard.confirm")}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
