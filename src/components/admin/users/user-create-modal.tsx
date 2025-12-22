"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Lock, Shield, Loader2, Sparkles, Users } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

type Role = "user" | "admin" | "moderator";
type UserSource = "tengra" | "lova" | "geofrontier" | "biodefenders";

import { createAdminUser } from "@/lib/db";

type UserFormData = {
    email: string;
    username: string;
    password: string;
    displayName: string;
    role: Role;
    source: UserSource;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

const ROLE_OPTIONS: { value: Role; labelKey: string }[] = [
    { value: "user", labelKey: "roles.user" },
    { value: "moderator", labelKey: "roles.moderator" },
    { value: "admin", labelKey: "roles.admin" },
];

const SOURCE_OPTIONS: { value: UserSource; labelKey: string }[] = [
    { value: "tengra", labelKey: "sources.tengra" },
    { value: "lova", labelKey: "sources.lova" },
    { value: "geofrontier", labelKey: "sources.geofrontier" },
    { value: "biodefenders", labelKey: "sources.biodefenders" },
];

// Turkish first/last names for mock data
const MOCK_FIRST_NAMES = ["Elif", "Deniz", "Ege", "Mert", "Zeynep", "Kaan", "Selin", "Emir", "Derya", "Baran", "Asya", "Burak", "Ceren", "Can", "Yigit", "Ada", "Ece", "Eylul"];
const MOCK_LAST_NAMES = ["Yildiz", "Kaya", "Demir", "Aydin", "Celik", "Sahin", "Yilmaz", "Kurt", "Aksoy", "Polat", "Ozdemir", "Ozturk"];

function generateMockUser(): UserFormData {
    const firstName = MOCK_FIRST_NAMES[Math.floor(Math.random() * MOCK_FIRST_NAMES.length)];
    const lastName = MOCK_LAST_NAMES[Math.floor(Math.random() * MOCK_LAST_NAMES.length)];
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
    const email = `${username}@tengra.studio`;
    const password = `Test${Math.random().toString(36).slice(2, 8)}!`;

    return {
        email,
        username,
        password,
        displayName: `${firstName} ${lastName}`,
        role: "user",
        source: "tengra",
    };
}

function generatePassword(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
        pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
}

export default function UserCreateModal({ open, onClose, onSuccess }: Props) {
    const t = useTranslations("AdminUsers");
    const [formData, setFormData] = useState<UserFormData>({
        email: "",
        username: "",
        password: "",
        displayName: "",
        role: "user",
        source: "tengra",
    });
    const [loading, setLoading] = useState(false);
    const [bulkCount, setBulkCount] = useState(5);
    const [bulkLoading, setBulkLoading] = useState(false);

    const handleChange = (field: keyof UserFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGenerateMock = () => {
        setFormData(generateMockUser());
    };

    const handleGeneratePassword = () => {
        setFormData((prev) => ({ ...prev, password: generatePassword() }));
    };

    const handleSubmit = useCallback(async () => {
        if (!formData.email || !formData.username || !formData.password) {
            toast.error(t("create.toast.missingFields"));
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("No token");

            const user = await createAdminUser(formData, token);

            if (user) {
                toast.success(t("create.toast.success"));
                onSuccess();
                onClose();
                setFormData({
                    email: "",
                    username: "",
                    password: "",
                    displayName: "",
                    role: "user",
                    source: "tengra",
                });
            } else {
                toast.error(t("create.toast.failure"));
            }
        } catch (err) {
            console.error(err);
            toast.error(t("create.toast.genericError"));
        } finally {
            setLoading(false);
        }
    }, [formData, onSuccess, onClose, t]);

    const handleBulkCreate = useCallback(async () => {
        if (bulkCount < 1 || bulkCount > 100) {
            toast.error(t("create.toast.bulkRangeError"));
            return;
        }

        setBulkLoading(true);
        let successCount = 0;

        try {
            const token = localStorage.getItem("authToken") || "";
            if (!token) throw new Error("No token");

            for (let i = 0; i < bulkCount; i++) {
                const mockUser = generateMockUser();
                const user = await createAdminUser(mockUser, token);
                if (user) {
                    successCount++;
                }
                // Small delay to avoid overwhelming the server
                await new Promise((r) => setTimeout(r, 100));
            }

            toast.success(t("create.toast.bulkSuccess", { successCount, bulkCount }));
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(t("create.toast.bulkError"));
        } finally {
            setBulkLoading(false);
        }
    }, [bulkCount, onSuccess, onClose, t]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-lg rounded-2xl border border-[rgba(72,213,255,0.15)] bg-[rgba(15,31,54,0.95)] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(30,184,255,0.08)] backdrop-blur-xl">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--text-muted)]" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-[rgba(30,184,255,0.1)]">
                                    <User className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t("create.title")}</h2>
                                    <p className="text-sm text-[var(--text-muted)]">{t("create.subtitle")}</p>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Quick actions */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleGenerateMock}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.15)] transition-colors"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {t("create.quick.random")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGeneratePassword}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                        {t("create.quick.password")}
                                    </button>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">{t("fields.email")}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            placeholder={t("placeholders.email")}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Username & Display Name */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">{t("fields.username")}</label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => handleChange("username", e.target.value)}
                                            placeholder={t("placeholders.username")}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">{t("fields.displayName")}</label>
                                        <input
                                            type="text"
                                            value={formData.displayName}
                                            onChange={(e) => handleChange("displayName", e.target.value)}
                                            placeholder={t("placeholders.displayName")}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">{t("fields.password")}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                        <input
                                            type="text"
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            placeholder={t("placeholders.password")}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Role & Source */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">{t("fields.role")}</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                            <select
                                                value={formData.role}
                                                onChange={(e) => handleChange("role", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors appearance-none cursor-pointer"
                                            >
                                                {ROLE_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">{t("fields.source")}</label>
                                        <select
                                            value={formData.source}
                                            onChange={(e) => handleChange("source", e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors appearance-none cursor-pointer"
                                        >
                                            {SOURCE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-[rgba(72,213,255,0.1)] my-2" />

                                {/* Bulk create */}
                                <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(72,213,255,0.08)] p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Users className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                                        <span className="text-sm font-medium text-[var(--text-secondary)]">{t("bulk.title")}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={bulkCount}
                                            onChange={(e) => setBulkCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                            className="w-20 px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(72,213,255,0.12)] text-sm text-center text-[var(--text-primary)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none"
                                        />
                                        <span className="text-xs text-[var(--text-muted)]">{t("bulk.countLabel")}</span>
                                        <button
                                            type="button"
                                            onClick={handleBulkCreate}
                                            disabled={bulkLoading}
                                            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
                                        >
                                            {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            {t("bulk.action")}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                >
                                    {t("actions.cancel")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] text-white shadow-[0_4px_20px_rgba(30,184,255,0.25)] hover:from-[var(--color-turkish-blue-400)] hover:to-[var(--color-turkish-blue-500)] disabled:opacity-50 transition-all"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {t("create.action")}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
