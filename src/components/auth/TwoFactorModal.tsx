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


    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remaining, setRemaining] = useState<number>(expirySeconds);
    const [expired, setExpired] = useState(false);
    const [currentTempToken, setCurrentTempToken] = useState<string>(tempToken);
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
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
        inputRef.current?.focus();

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setCode(value.slice(0, 6));
        setError(null);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
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
            setCode("");
            setError(friendly);
            inputRef.current?.focus();
        } catch (err) {
            console.error("2FA verification failed:", err);
            setError("Verification failed. Please try again.");
            setCode("");
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
                setCode("");
                setError(null);
                inputRef.current?.focus();
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
            <div aria-hidden={false} role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.85)] dark:bg-[rgba(0,0,0,0.85)]">
                <div className="w-full max-w-md bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg p-6 shadow-lg">
                    <h2 className="text-lg font-medium mb-2">Enter verification code</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">A 6-digit verification code was sent to your email.</p>

                    <div className="mb-4 text-sm text-gray-500 dark:text-gray-300">Code expires in: <span className="font-mono">{formatTime(remaining)}</span></div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            aria-label="2fa-code"
                            ref={inputRef}
                            value={code}
                            onChange={handleChange}
                            className="w-full text-center text-2xl tracking-widest p-2 border rounded bg-white dark:bg-zinc-800 text-black dark:text-white border-gray-300 dark:border-zinc-700"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoFocus
                            disabled={expired}
                        />

                        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

                        <div className="flex justify-end">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="px-3 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded disabled:opacity-60"
                                >
                                    Resend
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || expired}
                                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                                >
                                    {loading ? "Verifying..." : "Verify"}
                                </button>
                            </div>
                        </div>
                    </form>

                    <p className="text-xs text-gray-400 mt-4">This dialog cannot be closed while verification is pending.</p>
                </div>
            </div>
        </>
    );
}
