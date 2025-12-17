"use client";

import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://api.tengra.studio";

interface TwoFactorSettingsProps {
    token: string;
}

export default function TwoFactorSettings({ token }: TwoFactorSettingsProps) {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [setupMode, setSetupMode] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [disableCode, setDisableCode] = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [copied, setCopied] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch 2FA status
    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await fetch(`${API_URL}/account/2fa/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setEnabled(data.enabled ?? false);
            } catch (err) {
                console.error("Failed to fetch 2FA status", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStatus();
    }, [token]);

    // Start 2FA setup
    const handleSetup = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/account/2fa/setup`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (data.success && data.qrCode) {
                setQrCode(data.qrCode);
                setSecret(data.secret);
                setSetupMode(true);
            } else {
                toast.error(data.message || "2FA kurulumu başarısız");
            }
        } catch (err) {
            toast.error("Bir hata oluştu");
        } finally {
            setSubmitting(false);
        }
    };

    // Verify and enable 2FA
    const handleVerify = async () => {
        if (verifyCode.length !== 6) {
            toast.error("6 haneli kod girin");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/account/2fa/verify`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: verifyCode }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("2FA başarıyla aktifleştirildi!");
                setEnabled(true);
                setSetupMode(false);
                setQrCode(null);
                setSecret(null);
                setVerifyCode("");
            } else {
                toast.error(data.message || "Kod doğrulanamadı");
            }
        } catch (err) {
            toast.error("Bir hata oluştu");
        } finally {
            setSubmitting(false);
        }
    };

    // Disable 2FA
    const handleDisable = async () => {
        if (disableCode.length !== 6) {
            toast.error("6 haneli kod girin");
            return;
        }
        if (!disablePassword) {
            toast.error("Şifrenizi girin");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/account/2fa/disable`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: disableCode, password: disablePassword }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("2FA devre dışı bırakıldı");
                setEnabled(false);
                setDisableCode("");
                setDisablePassword("");
            } else {
                toast.error(data.message || "2FA kapatılamadı");
            }
        } catch (err) {
            toast.error("Bir hata oluştu");
        } finally {
            setSubmitting(false);
        }
    };

    const copySecret = () => {
        if (secret) {
            navigator.clipboard.writeText(secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-turkish-blue-400)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${enabled
                        ? "bg-green-500/20 text-green-400"
                        : "bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-400)]"
                    }`}>
                    {enabled ? <ShieldCheck className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">İki Faktörlü Doğrulama (2FA)</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                        {enabled ? "Aktif - Hesabınız korunuyor" : "Hesabınızı daha güvenli hale getirin"}
                    </p>
                </div>
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${enabled
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                }`}>
                {enabled ? (
                    <>
                        <CheckCircle className="h-4 w-4" />
                        2FA Aktif
                    </>
                ) : (
                    <>
                        <AlertCircle className="h-4 w-4" />
                        2FA Kapalı
                    </>
                )}
            </div>

            {/* Setup Mode */}
            {setupMode && qrCode && (
                <div className="space-y-4 rounded-xl border border-[rgba(72,213,255,0.15)] bg-[rgba(15,31,54,0.5)] p-6">
                    <h4 className="font-medium text-white">2FA Kurulumu</h4>

                    <div className="flex flex-col items-center gap-4">
                        {/* QR Code */}
                        <div className="rounded-xl bg-white p-4">
                            <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
                        </div>

                        <p className="text-center text-sm text-[var(--text-muted)]">
                            Google Authenticator veya benzeri bir uygulama ile QR kodu tarayın
                        </p>

                        {/* Manual Entry */}
                        {secret && (
                            <div className="w-full space-y-2">
                                <p className="text-xs text-[var(--text-muted)]">Veya manuel giriş yapın:</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 rounded-lg bg-[rgba(0,0,0,0.3)] px-3 py-2 text-sm font-mono text-white">
                                        {secret}
                                    </code>
                                    <button
                                        onClick={copySecret}
                                        className="rounded-lg bg-[rgba(30,184,255,0.1)] p-2 text-[var(--color-turkish-blue-400)] hover:bg-[rgba(30,184,255,0.2)] transition"
                                    >
                                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Verification Input */}
                        <div className="w-full space-y-2">
                            <label className="text-sm text-[var(--text-muted)]">Doğrulama Kodu</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="000000"
                                className="w-full rounded-xl border border-[rgba(72,213,255,0.15)] bg-[rgba(15,31,54,0.5)] px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder:tracking-normal placeholder:text-[var(--text-muted)] focus:border-[var(--color-turkish-blue-400)] focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSetupMode(false);
                                    setQrCode(null);
                                    setSecret(null);
                                }}
                                className="rounded-xl border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.05)] transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleVerify}
                                disabled={submitting || verifyCode.length !== 6}
                                className="rounded-xl bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] px-6 py-2 text-sm font-medium text-white shadow-lg hover:from-[var(--color-turkish-blue-400)] hover:to-[var(--color-turkish-blue-500)] transition disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aktifleştir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Disable Mode */}
            {enabled && !setupMode && (
                <div className="space-y-4 rounded-xl border border-[rgba(255,100,100,0.15)] bg-[rgba(255,50,50,0.05)] p-6">
                    <h4 className="font-medium text-white flex items-center gap-2">
                        <ShieldOff className="h-4 w-4 text-red-400" />
                        2FA Devre Dışı Bırak
                    </h4>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-muted)]">Mevcut 2FA Kodu</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={disableCode}
                                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="000000"
                                className="w-full rounded-xl border border-[rgba(255,100,100,0.15)] bg-[rgba(15,31,54,0.5)] px-4 py-3 text-center text-xl font-mono tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-[var(--text-muted)] focus:border-red-400 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-muted)]">Şifreniz</label>
                            <input
                                type="password"
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-[rgba(255,100,100,0.15)] bg-[rgba(15,31,54,0.5)] px-4 py-3 text-white placeholder:text-[var(--text-muted)] focus:border-red-400 focus:outline-none"
                            />
                        </div>

                        <button
                            onClick={handleDisable}
                            disabled={submitting || disableCode.length !== 6 || !disablePassword}
                            className="rounded-xl bg-red-500/20 px-6 py-2 text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/30 transition disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "2FA'yı Kapat"}
                        </button>
                    </div>
                </div>
            )}

            {/* Enable Button */}
            {!enabled && !setupMode && (
                <button
                    onClick={handleSetup}
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] px-6 py-3 text-sm font-medium text-white shadow-lg hover:from-[var(--color-turkish-blue-400)] hover:to-[var(--color-turkish-blue-500)] transition disabled:opacity-50"
                >
                    {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Shield className="h-4 w-4" />
                            2FA'yı Aktifleştir
                        </>
                    )}
                </button>
            )}

            {/* Info */}
            <div className="rounded-xl bg-[rgba(30,184,255,0.05)] border border-[rgba(30,184,255,0.1)] p-4">
                <p className="text-sm text-[var(--text-muted)]">
                    <strong className="text-white">İki faktörlü doğrulama</strong> hesabınıza ekstra bir güvenlik katmanı ekler.
                    Her giriş yaptığınızda şifrenizin yanı sıra telefonunuzdaki uygulamadan alacağınız 6 haneli kodu da girmeniz gerekir.
                </p>
            </div>
        </div>
    );
}
