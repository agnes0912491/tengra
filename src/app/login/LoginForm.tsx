"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { GoogleButton } from "@/components/auth/google-button";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextUrlParam = searchParams.get("next");
    const safeNextUrl =
        nextUrlParam && !nextUrlParam.startsWith("/login")
            ? nextUrlParam
            : "/";
    const { login, user, isAuthenticated } = useAuth();
    const t = useTranslations("Auth");

    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            router.replace(safeNextUrl);
        }
    }, [isAuthenticated, router, user, safeNextUrl]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const email = credentials.email.trim();
            const password = credentials.password;

            if (!email || !password) {
                toast.error(t("login.toast.missingCredentials"));
                return;
            }

            setLoading(true);

            const result = await login(email, password, "user");

            if (result.success) {
                toast.success(t("login.toast.success"));
                router.replace(safeNextUrl);
                router.refresh();
                return;
            }

            if (result.reason === "requires2FA") {
                toast.info(t("login.toast.requires2FA"));
                return;
            }

            const failureMessage =
                result.reason === "invalidCredentials"
                    ? t("login.toast.invalidCredentials")
                    : t("login.toast.genericError");

            toast.error(failureMessage);
        } catch (err) {
            console.error("Login failed:", err);
            toast.error(t("login.toast.genericError"));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credential: string) => {
        setLoading(true);
        try {
            // Using lova-api for Google Verification
            const response = await fetch("https://api.lova.tengra.studio/auth/google-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idToken: credential,
                    source: "web_client_google"
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Google login failed");
            }

            if (data.isNew) {
                // Redirect to Register page with Google Data token
                // We pass the ID Token in URL to let Register page pre-fill
                const params = new URLSearchParams();
                params.set("google_token", credential);
                params.set("email", data.googleData.email);
                params.set("first_name", data.googleData.firstName || "");
                params.set("last_name", data.googleData.lastName || "");
                params.set("avatar", data.googleData.avatar || "");

                router.push(`/register?${params.toString()}`);
            } else {
                // Existing User - We have a token from lova-api, BUT web-client expects login against localhost:5000 (core-cpp) usually
                // However, creating a session via lova-api (which writes to shared DB) should validly log us in?
                // web-client auth-provider uses `localStorage.setItem("authToken", token)`
                // The token returned by lova-api is valid for the ecosystem if they share secrets.
                // Assuming they share secrets or DB-session mechanism.
                // If not, we might need to "login" again.
                // But let's try using the token.

                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                    // Force a reload/refresh to pick up auth state
                    window.location.href = safeNextUrl;
                } else {
                    toast.error("Giriş başarılı fakat token alınamadı.");
                }
            }
        } catch (err: any) {
            console.error("Google Auth Error:", err);
            toast.error("Google ile giriş yapılamadı: " + err.message);
        } finally {
            setLoading(false);
        }
    };

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
                            <LogIn className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-display font-bold tracking-wider text-[var(--text-primary)]">
                                {t("login.title")}
                            </h1>
                            <p className="mt-2 text-sm text-[var(--text-muted)]">
                                {t("login.description")}
                            </p>
                        </div>
                    </div>

                    {/* Google Button */}
                    <div className="w-full">
                        <GoogleButton
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error("Google ile bağlanılamadı")}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[rgba(72,213,255,0.1)]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[rgba(15,31,54,0.9)] px-4 text-[var(--text-muted)]">
                                VEYA E-POSTA İLE
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="email">
                                {t("login.emailLabel")}
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
                                    value={credentials.email}
                                    onChange={(e) => setCredentials((p) => ({ ...p, email: e.target.value }))}
                                    className="pl-11"
                                    placeholder={t("login.emailPlaceholder")}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="password">
                                    {t("login.passwordLabel")}
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-[var(--color-turkish-blue-400)] hover:text-[var(--color-turkish-blue-300)] transition-colors"
                                >
                                    {t("login.forgotPassword")}
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={credentials.password}
                                    onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
                                    className="pl-11 pr-11"
                                    placeholder={t("login.passwordPlaceholder")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" variant="default" size="lg" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {t("login.button.loading")}
                                </span>
                            ) : (
                                t("login.button.submit")
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
                                {t("login.or")}
                            </span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <p className="text-sm text-center text-[var(--text-muted)]">
                        {t("login.noAccount")}{" "}
                        <Link
                            href="/register"
                            className="font-medium text-[var(--color-turkish-blue-400)] hover:text-[var(--color-turkish-blue-300)] transition-colors"
                        >
                            {t("login.registerLink")}
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
