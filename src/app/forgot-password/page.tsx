"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Mail, SendHorizonal, Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/db";
import { useTranslation } from "@tengra/language";

export default function ForgotPasswordPage() {
    const { t } = useTranslation("Auth.forgotPassword");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error(t("emailRequired"));
            return;
        }
        setLoading(true);
        try {
            const ok = await requestPasswordReset(email.trim());
            if (ok) {
                toast.success(t("success"));
                setEmail("");
            } else {
                toast.error(t("requestFailed"));
            }
        } catch (err) {
            console.error("Password reset request failed", err);
            toast.error(t("genericError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.1)_0%,transparent_60%)]" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(72,213,255,0.08)_0%,transparent_60%)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="space-y-2 text-sm text-[rgba(255,255,255,0.65)]">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-[rgba(130,226,255,0.95)] hover:text-white transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t("back")}
                    </button>
                </div>
                <div className="mt-3 rounded-2xl border border-[rgba(72,213,255,0.15)] bg-[rgba(15,31,54,0.75)] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(30,184,255,0.1)] backdrop-blur-xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] shadow-[0_8px_30px_rgba(30,184,255,0.3)]">
                            <Mail className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-display font-bold tracking-wide text-white">{t("title")}</h1>
                        <p className="text-sm text-[rgba(255,255,255,0.65)]">
                            {t("description")}
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.75)]">
                            {t("emailLabel")}
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.5)]">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    className="pl-10"
                                    placeholder={t("emailPlaceholder")}
                                />
                            </div>
                        </label>

                        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("submitting")}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    <SendHorizonal className="h-4 w-4" />
                                    {t("submit")}
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </section>
    );
}
