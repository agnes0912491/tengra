"use client";

import React, { useEffect, useRef, useState } from "react";
import { verifyTempToken, resendTempToken } from "@/lib/db";
import { toast } from "react-toastify";
import { AuthUserPayload } from "@/types/auth";

type Props = {
    tempToken: string;
    onSuccess: (payload: AuthUserPayload) => void;
    // optional expiry in seconds (defaults to 300 = 5 minutes)
    expirySeconds?: number;
};

export default function TwoFactorModal({ tempToken, onSuccess, expirySeconds = 300, }: Props) {


    const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remaining, setRemaining] = useState<number>(expirySeconds);
    const [expired, setExpired] = useState(false);
    const [currentTempToken, setCurrentTempToken] = useState<string>(tempToken);
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null, null]);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        setCurrentTempToken(tempToken);
        setRemaining(expirySeconds);
        setExpired(false);
    }, [tempToken, expirySeconds]);

    // cooldown timer for resend button
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const id = window.setInterval(() => {
            setResendCooldown((c) => {
                if (c <= 1) {
                    window.clearInterval(id);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => window.clearInterval(id);
    }, [resendCooldown]);

    useEffect(() => {
        inputsRef.current[0]?.focus();

        // start countdown
        setRemaining(expirySeconds);
        setExpired(false);
        timerRef.current = window.setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    // expire
                    window.clearInterval(timerRef.current ?? 0);
                    timerRef.current = null;
                    setExpired(true);
                    return 0;
                }
                return r - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [tempToken, expirySeconds]);

    useEffect(() => {
        if (expired) {
            setError("Verification code expired. Request a new code and try again.");
        }
    }, [expired]);

    function formatTime(s: number) {
        const mm = Math.floor(s / 60)
            .toString()
            .padStart(2, "0");
        const ss = (s % 60).toString().padStart(2, "0");
        return `${mm}:${ss}`;
    }

    const pasteIntoInputs = (text: string) => {
        const clean = text.replace(/[^0-9]/g, "").slice(0, 6);
        if (!clean) return;
        const arr = clean.split("");
        const next = ["", "", "", "", "", ""];
        for (let i = 0; i < arr.length; i++) next[i] = arr[i];
        setDigits(next);
        const focusIndex = Math.min(arr.length, 5);
        inputsRef.current[focusIndex]?.focus();
        setError(null);
    };

    const handleInputChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (!value) {
            setDigits((prev) => {
                const next = [...prev];
                next[index] = "";
                return next;
            });
            return;
        }
        setDigits((prev) => {
            const next = [...prev];
            // take the last typed digit
            next[index] = value[value.length - 1] ?? "";
            return next;
        });
        // move focus right
        if (index < 5) inputsRef.current[index + 1]?.focus();
        setError(null);
    };

    const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                // clear current box
                setDigits((prev) => {
                    const next = [...prev];
                    next[index] = "";
                    return next;
                });
            } else if (index > 0) {
                // go left
                inputsRef.current[index - 1]?.focus();
                setDigits((prev) => {
                    const next = [...prev];
                    next[index - 1] = "";
                    return next;
                });
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const code = digits.join("");
        if (code.length !== 6) {
            setError("Please enter a 6-digit code");
            return;
        }

        if (expired) return;

        setLoading(true);
        try {
            const payload = await verifyTempToken(currentTempToken, code);
            if (payload && payload.success && payload.token) {
                if (timerRef.current) window.clearInterval(timerRef.current);
                onSuccess(payload);
                return;
            }

            // Not successful — show more specific message if server provided one
            const err = payload?.error ?? payload?.message ?? "Verification failed";

            // Map common server-side error codes/messages to friendly texts
            let friendly = "Verification failed. Please try again.";
            if (err) {
                const eLower = err.toLowerCase();
                if (eLower.includes("expired") || eLower.includes("time")) {
                    friendly = "Verification code expired. Request a new code.";
                    setExpired(true);
                } else if (eLower.includes("invalid") || eLower.includes("incorrect")) {
                    friendly = "Invalid verification code. Please try again.";
                } else if (eLower.includes("too many") || eLower.includes("attempt")) {
                    friendly = "Too many attempts. Please request a new code or try later.";
                } else if (err === "unexpected_response") {
                    friendly = "Server returned an unexpected response. Try again later.";
                } else {
                    friendly = err;
                }
            }

            // reset input on invalid code
            setDigits(["", "", "", "", "", ""]);
            setError(friendly);
            inputsRef.current[0]?.focus();
        } catch (err) {
            console.error("2FA verification failed:", err);
            setError("Verification failed. Please try again.");
            setDigits(["", "", "", "", "", ""]);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (loading) return;
        if (resendCooldown > 0) return;
        setLoading(true);
        setError(null);
        try {
            const payload = await resendTempToken(currentTempToken);
            if (payload && payload.success && payload.tempToken) {
                // update token and reset timer
                setCurrentTempToken(payload.tempToken);
                const nowSec = Math.floor(Date.now() / 1000);
                const secs = payload.expiresAt ? Math.max(1, Math.floor(payload.expiresAt - nowSec)) : (payload.expiresIn ?? expirySeconds);
                setRemaining(secs);
                setExpired(false);
                setDigits(["", "", "", "", "", ""]);
                setError(null);
                inputsRef.current[0]?.focus();
                // show success toast and start cooldown (30s)
                toast.success("Verification code resent", { autoClose: 3000 });
                setResendCooldown(30);
                return;
            }

            // If server returned success:false, show message
            const err = payload?.error ?? payload?.message ?? "Failed to resend code";
            setError(typeof err === "string" ? err : "Failed to resend code");
        } catch (err) {
            console.error("Failed to resend 2FA code:", err);
            setError("Failed to resend code. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div aria-hidden={false} role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)]">
                <div className="w-full max-w-md rounded-3xl border border-[rgba(110,211,225,0.18)] bg-[rgba(6,20,27,0.9)]/90 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl text-white">
                    <h2 className="font-display text-lg uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-300)] mb-2">Doğrulama Kodu</h2>
                    <p className="text-sm text-[rgba(255,255,255,0.75)] mb-2">E-postanıza gönderilen 6 haneli kodu giriniz.</p>

                    <div className="mb-4 text-sm text-[rgba(255,255,255,0.6)]">Kodun süresi: <span className="font-mono">{formatTime(remaining)}</span></div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-center gap-2" onPaste={(e) => {
                            e.preventDefault();
                            const text = e.clipboardData.getData("text");
                            pasteIntoInputs(text);
                        }}>
                            {digits.map((val, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputsRef.current[i] = el; }}
                                    value={val}
                                    onChange={handleInputChange(i)}
                                    onKeyDown={handleKeyDown(i)}
                                    className="h-12 w-10 rounded-md border border-[rgba(110,211,225,0.3)] bg-[rgba(3,12,18,0.85)] text-center text-xl tracking-[0.3em] text-white focus:border-[rgba(110,211,225,0.6)] focus:outline-none"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    disabled={expired}
                                />
                            ))}
                        </div>

                        {error && <div className="text-sm text-red-400">{error}</div>}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={loading || resendCooldown > 0}
                                className="rounded-full border border-[rgba(110,211,225,0.35)] bg-[rgba(8,28,38,0.65)] px-4 py-2 text-xs uppercase tracking-[0.35em] text-[rgba(255,255,255,0.85)] disabled:opacity-60"
                            >
                                {resendCooldown > 0 ? `Tekrar Gönder (${resendCooldown})` : "Tekrar Gönder"}
                            </button>
                            <button
                                type="submit"
                                disabled={loading || expired}
                                className="rounded-full bg-[color:var(--color-turkish-blue-500)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-black disabled:opacity-60"
                            >
                                {loading ? "Doğrulanıyor…" : "Doğrula"}
                            </button>
                        </div>
                    </form>

                    <p className="text-xs text-[rgba(255,255,255,0.5)] mt-4">Doğrulama beklenirken bu pencere kapatılamaz.</p>
                </div>
            </div>
        </>
    );
}
