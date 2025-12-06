"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/db";

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const token = params.get("token") ?? "";
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [missingToken, setMissingToken] = useState(false);

    useEffect(() => {
        if (!token) {
            setMissingToken(true);
        }
    }, [token]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) {
            toast.error("Geçersiz veya eksik token.");
            return;
        }
        if (!password || password.length < 8) {
            toast.error("Parola en az 8 karakter olmalı.");
            return;
        }
        if (password !== confirm) {
            toast.error("Parolalar eşleşmiyor.");
            return;
        }
        setLoading(true);
        try {
            const ok = await resetPassword(token, password);
            if (ok) {
                toast.success("Parola başarıyla güncellendi. Giriş yapabilirsiniz.");
                router.replace("/login");
            } else {
                toast.error("Parola güncellenemedi. Bağlantı süresi dolmuş olabilir.");
            }
        } catch (err) {
            console.error("Password reset failed", err);
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    if (missingToken) {
        return (
            <section className="flex min-h-screen items-center justify-center px-6 py-20 text-center text-[rgba(255,255,255,0.75)]">
                <div className="space-y-3">
                    <p>Geçersiz veya eksik şifre sıfırlama bağlantısı.</p>
                    <Button variant="secondary" onClick={() => router.push("/forgot-password")}>
                        Şifre sıfırlama isteği gönder
                    </Button>
                </div>
            </section>
        );
    }

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
                        Geri dön
                    </button>
                </div>
                <div className="mt-3 rounded-2xl border border-[rgba(72,213,255,0.15)] bg-[rgba(15,31,54,0.75)] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(30,184,255,0.1)] backdrop-blur-xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] shadow-[0_8px_30px_rgba(30,184,255,0.3)]">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-display font-bold tracking-wide text-white">Yeni şifre belirle</h1>
                        <p className="text-sm text-[rgba(255,255,255,0.65)]">
                            Güvenliğiniz için güçlü bir parola seçin.
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.75)]">
                            Yeni şifre
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.5)]">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </label>

                        <label className="space-y-2 text-sm text-[rgba(255,255,255,0.75)]">
                            Şifreyi tekrar girin
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.5)]">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </label>

                        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Güncelleniyor...
                                </span>
                            ) : (
                                "Şifreyi Güncelle"
                            )}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </section>
    );
}
