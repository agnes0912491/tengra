"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@tengra/language";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import { UserPlus, Mail, User } from "lucide-react";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { AvatarUpload } from "@/components/auth/AvatarUpload";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { TermsText } from "@/components/auth/TermsText";
import { toast } from "react-toastify";

export default function RegisterForm() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { t } = useTranslation("Auth");

    const {
        formData,
        setFormData,
        handleSubmit,
        handleAvatarDrop,
        avatarPreview,
        avatarError,
        avatarUploadedUrl,
        loading,
        setAvatarPreview,
        setAvatarError
    } = useRegisterForm();

    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
    const passwordStrength = formData.password.length >= 8 ? 3 : 1; // Simplified for UI enable check

    useEffect(() => {
        if (isAuthenticated && user) {
            router.replace("/");
        }
    }, [isAuthenticated, router, user]);

    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.1)_0%,transparent_60%)]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(72,213,255,0.08)_0%,transparent_60%)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="rounded-2xl bg-[rgba(15,31,54,0.7)] border border-[rgba(72,213,255,0.15)] shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(30,184,255,0.1)] backdrop-blur-xl p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] flex items-center justify-center shadow-[0_8px_30px_rgba(30,184,255,0.3)]"
                        >
                            <UserPlus className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-display font-bold tracking-wider text-[var(--text-primary)]">
                                {t("register.title")}
                            </h1>
                            <p className="mt-2 text-sm text-[var(--text-muted)]">
                                {t("register.description")}
                            </p>
                        </div>
                    </div>

                    {/* Google Button */}
                    <div className="w-full">
                        <GoogleButton
                            onSuccess={async (cred) => {
                                // Google handling logic, ideally also moved to hook but kept for simplicity here
                                try {
                                    const response = await fetch("/api/google-auth", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            idToken: cred,
                                            source: "web_client_google"
                                        })
                                    });
                                    const data = await response.json();
                                    if (!response.ok) throw new Error(data.error);

                                    if (data.isNew) {
                                        setFormData(prev => ({
                                            ...prev,
                                            email: data.googleData.email,
                                            username: ((data.googleData.firstName || "") + (data.googleData.lastName || "")).toLowerCase().replace(/\s/g, ""),
                                        }));
                                        if (data.googleData.avatar) {
                                            setAvatarPreview(data.googleData.avatar);
                                        }
                                    } else if (data.token) {
                                        const Cookies = (await import("js-cookie")).default;
                                        const hostname = window.location.hostname;
                                        const isTengra = hostname.includes("tengra.studio");
                                        const domain = isTengra ? ".tengra.studio" : undefined;
                                        Cookies.set("authToken", data.token, { expires: 30, path: "/", domain });
                                        window.location.href = "/";
                                    }
                                } catch (e) { toast.error("Google Auth Failed"); }
                            }}
                            onError={() => toast.error("Google ile bağlanılamadı")}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[rgba(72,213,255,0.1)]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[rgba(15,31,54,0.9)] px-4 text-[var(--text-muted)]">
                                VEYA FORM İLE
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AvatarUpload
                            preview={avatarPreview}
                            error={avatarError}
                            success={!!avatarUploadedUrl}
                            onDrop={handleAvatarDrop}
                            onClear={() => {
                                setAvatarPreview(null);
                                setAvatarError(null);
                            }}
                        />

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="username">
                                {t("register.usernameLabel")}
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                    <User className="w-4 h-4" />
                                </div>
                                <Input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                                    className="pl-11"
                                    placeholder={t("register.usernamePlaceholder")}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="email">
                                {t("register.emailLabel")}
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                                    className="pl-11"
                                    placeholder={t("register.emailPlaceholder")}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="password">
                                {t("register.passwordLabel")}
                            </label>
                            <PasswordInput
                                id="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                                placeholder={t("register.passwordPlaceholder")}
                            />
                            {formData.password.length > 0 && <PasswordStrength password={formData.password} />}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="confirmPassword">
                                {t("register.confirmPasswordLabel")}
                            </label>
                            <PasswordInput
                                id="confirmPassword"
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder={t("register.confirmPasswordPlaceholder")}
                                className={formData.confirmPassword.length > 0 ? (passwordsMatch ? "border-green-500/50" : "border-red-500/50") : ""}
                            />
                            {formData.confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="text-xs text-red-400">{t("register.passwordMismatch")}</p>
                            )}
                        </div>

                        <TermsText />

                        <Button
                            type="submit"
                            variant="default"
                            size="lg"
                            className="w-full"
                            disabled={loading || !passwordsMatch}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {t("register.button.loading")}
                                </span>
                            ) : (
                                t("register.button.submit")
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[rgba(72,213,255,0.1)]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[rgba(15,31,54,0.9)] px-4 text-[var(--text-muted)]">
                                {t("register.or")}
                            </span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <p className="text-sm text-center text-[var(--text-muted)]">
                        {t("register.hasAccount")}{" "}
                        <Link
                            href="/login"
                            className="font-medium text-[var(--color-turkish-blue-400)] hover:text-[var(--color-turkish-blue-300)] transition-colors"
                        >
                            {t("register.loginLink")}
                        </Link>
                    </p>
                </div>

                {/* Back to home */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] transition-colors"
                    >
                        ← {t("backToHome")}
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
