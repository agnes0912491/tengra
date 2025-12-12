"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { registerUser, uploadRegisterAvatar } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropzone from "@/components/ui/dropzone";
import { UserPlus, Lock, Mail, User, Eye, EyeOff, Check, X, ImagePlus, Trash2 } from "lucide-react";

export default function RegisterForm() {
    const router = useRouter();
    const { user, isAuthenticated, login } = useAuth();
    const t = useTranslations("Auth");

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [avatarUploadedUrl, setAvatarUploadedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength indicators
    const passwordChecks = {
        minLength: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };

    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

    const handleAvatarDrop = useCallback(
        async (files: File[]) => {
            const file = files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                setAvatarError(t("register.avatar.invalidType"));
                setAvatarPreview(null);
                setAvatarUploadedUrl(null);
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setAvatarError(t("register.avatar.tooLarge"));
                setAvatarPreview(null);
                setAvatarUploadedUrl(null);
                return;
            }

            const compressImage = async (input: File): Promise<{ blob: Blob; preview: string }> => {
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(input);
                });

                try {
                    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = dataUrl;
                    });

                    const maxSide = 512;
                    const ratio = Math.min(maxSide / img.width, maxSide / img.height, 1);
                    const targetW = Math.max(1, Math.round(img.width * ratio));
                    const targetH = Math.max(1, Math.round(img.height * ratio));

                    const canvas = document.createElement("canvas");
                    canvas.width = targetW;
                    canvas.height = targetH;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) throw new Error("canvas ctx missing");
                    ctx.drawImage(img, 0, 0, targetW, targetH);

                    const blob = await new Promise<Blob>((resolve) => {
                        canvas.toBlob(
                            (b) => resolve(b || input),
                            "image/webp",
                            0.82
                        );
                    });

                    const previewUrl = canvas.toDataURL("image/webp", 0.82);
                    return { blob, preview: previewUrl };
                } catch {
                    return { blob: input, preview: dataUrl };
                }
            };

            setAvatarError(null);
            const { blob, preview } = await compressImage(file);

            if (blob.size > 10 * 1024 * 1024) {
                setAvatarError(t("register.avatar.tooLarge"));
                setAvatarPreview(null);
                setAvatarUploadedUrl(null);
                return;
            }

            setAvatarPreview(preview);

            // Upload to server immediately
            try {
                const uploaded = await uploadRegisterAvatar(blob);
                if (uploaded) {
                    setAvatarUploadedUrl(uploaded);
                } else {
                    setAvatarUploadedUrl(null);
                    setAvatarError(t("register.avatar.uploadFailed"));
                }
            } catch (e) {
                console.error("Avatar upload failed:", e);
                setAvatarUploadedUrl(null);
                setAvatarError(t("register.avatar.uploadFailed"));
            }
        },
        [t]
    );

    useEffect(() => {
        if (isAuthenticated && user) {
            router.replace("/");
        }
    }, [isAuthenticated, router, user]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const { username, email, password, confirmPassword } = formData;

            if (!username.trim() || !email.trim() || !password) {
                toast.error(t("register.toast.missingFields"));
                return;
            }

            if (password !== confirmPassword) {
                toast.error(t("register.toast.passwordMismatch"));
                return;
            }

            if (passwordStrength < 3) {
                toast.error(t("register.toast.weakPassword"));
                return;
            }

            setLoading(true);

            const result = await registerUser(
                username.trim(),
                email.trim(),
                password,
                undefined,
                username.trim(),
                avatarUploadedUrl || undefined
            );

            if (result.success) {
                toast.success(t("register.toast.success"));

                // Auto-login after successful registration
                const loginResult = await login(email.trim(), password, "user");
                if (loginResult.success) {
                    router.replace("/");
                    router.refresh();
                } else {
                    router.replace("/login");
                }
                return;
            }

            if (result.reason === "timeout") {
                toast.error(t("register.toast.timeout"));
            } else {
                toast.error(t("register.toast.genericError"));
            }
        } catch (err) {
            console.error("Registration failed:", err);
            toast.error(t("register.toast.genericError"));
        } finally {
            setLoading(false);
        }
    };

    const PasswordCheckItem = ({ passed, label }: { passed: boolean; label: string }) => (
        <div className={`flex items-center gap-2 text-xs ${passed ? "text-green-400" : "text-[var(--text-muted)]"}`}>
            {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {label}
        </div>
    );

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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Avatar */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">
                                {t("register.avatar.label")}
                            </label>
                            <Dropzone accept={{ "image/*": [] }} onDrop={handleAvatarDrop}>
                                <div className="flex w-full items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-full overflow-hidden border border-[rgba(72,213,255,0.2)] bg-[rgba(30,184,255,0.08)] flex items-center justify-center">
                                    {avatarPreview ? (
                                            <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
                                        ) : (
                                            <ImagePlus className="w-6 h-6 text-[var(--text-muted)]" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-[var(--text-secondary)]">{t("register.avatar.helper")}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{t("register.avatar.hint")}</p>
                                    </div>
                                    {avatarPreview ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAvatarPreview(null);
                                                setAvatarError(null);
                                            }}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                                            aria-label={t("register.avatar.remove")}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    ) : null}
                                </div>
                            </Dropzone>
                            {avatarError ? <p className="text-xs text-red-400">{avatarError}</p> : null}
                            {avatarUploadedUrl ? (
                                <p className="text-xs text-green-400 break-all">
                                    {t("register.avatar.uploaded")}
                                </p>
                            ) : null}
                        </div>

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
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                                    className="pl-11 pr-11"
                                    placeholder={t("register.passwordPlaceholder")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password strength indicator */}
                            {formData.password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-2 pt-2"
                                >
                                    {/* Strength bar */}
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= level
                                                        ? passwordStrength <= 2
                                                            ? "bg-red-500"
                                                            : passwordStrength <= 3
                                                                ? "bg-yellow-500"
                                                                : "bg-green-500"
                                                        : "bg-[rgba(72,213,255,0.1)]"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Checklist */}
                                    <div className="grid grid-cols-2 gap-1">
                                        <PasswordCheckItem passed={passwordChecks.minLength} label={t("register.password.minLength")} />
                                        <PasswordCheckItem passed={passwordChecks.hasUppercase} label={t("register.password.uppercase")} />
                                        <PasswordCheckItem passed={passwordChecks.hasLowercase} label={t("register.password.lowercase")} />
                                        <PasswordCheckItem passed={passwordChecks.hasNumber} label={t("register.password.number")} />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="confirmPassword">
                                {t("register.confirmPasswordLabel")}
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                                    className={`pl-11 pr-11 ${formData.confirmPassword.length > 0
                                            ? passwordsMatch
                                                ? "border-green-500/50"
                                                : "border-red-500/50"
                                            : ""
                                        }`}
                                    placeholder={t("register.confirmPasswordPlaceholder")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {formData.confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="text-xs text-red-400">{t("register.passwordMismatch")}</p>
                            )}
                        </div>

                        {/* Terms */}
                        <p className="text-xs text-[var(--text-muted)]">
                            {t("register.terms.prefix")}{" "}
                            <Link href="/terms" className="text-[var(--color-turkish-blue-400)] hover:underline">
                                {t("register.terms.termsLink")}
                            </Link>{" "}
                            {t("register.terms.and")}{" "}
                            <Link href="/privacy" className="text-[var(--color-turkish-blue-400)] hover:underline">
                                {t("register.terms.privacyLink")}
                            </Link>{" "}
                            {t("register.terms.suffix")}
                        </p>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            disabled={loading || !passwordsMatch || passwordStrength < 3}
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
