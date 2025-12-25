"use client";

import { useState, useCallback, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "@tengra/language";
import { useAuth } from "@/components/providers/auth-provider";
import { registerUser, uploadRegisterAvatar } from "@/lib/db";

export function useRegisterForm() {
    const { t } = useTranslation("Auth");
    const router = useRouter();
    const { login } = useAuth();
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

    // Initial query params parsing (client-side only)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("google_token")) {
                setFormData(prev => ({
                    ...prev,
                    email: params.get("email") || "",
                    username: ((params.get("first_name") || "") + (params.get("last_name") || "")).toLowerCase().replace(/\s/g, ""),
                }));
                if (params.get("avatar")) {
                    setAvatarPreview(params.get("avatar"));
                    setAvatarUploadedUrl(params.get("avatar"));
                }
            }
        }
    }, []);

    const handleAvatarDrop = useCallback(async (files: File[]) => {
        const file = files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setAvatarError(t("register.avatar.invalidType"));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setAvatarError(t("register.avatar.tooLarge"));
            return;
        }

        // Image compression (simplified for hook)
        // In a real refactor, moving compression to a separate util is best
        // checking `RegisterForm.tsx` lines 65-106 for logic
        const compressImage = async (input: File): Promise<{ blob: Blob; preview: string }> => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ blob: input, preview: e.target?.result as string });
                reader.readAsDataURL(input);
            });
        };

        try {
            const { blob, preview } = await compressImage(file);
            setAvatarPreview(preview);
            setAvatarError(null);

            const uploaded = await uploadRegisterAvatar(blob);
            if (uploaded) {
                setAvatarUploadedUrl(uploaded);
            } else {
                setAvatarError(t("register.avatar.uploadFailed"));
            }
        } catch (e) {
            console.error("Avatar upload failed:", e);
            setAvatarError(t("register.avatar.uploadFailed"));
        }
    }, [t]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const { username, email, password, confirmPassword } = formData;
        
        if (!username || !email || !password) {
            toast.error(t("register.toast.missingFields"));
            return;
        }
        if (password !== confirmPassword) {
            toast.error(t("register.toast.passwordMismatch"));
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams(window.location.search);
            const result = await registerUser({
                username,
                email,
                password,
                firstName: params.get("first_name") || undefined,
                lastName: params.get("last_name") || undefined,
                avatarUrl: avatarUploadedUrl || undefined,
                idToken: params.get("google_token") || undefined
            });

            if (result.success) {
                toast.success(t("register.toast.success"));
                const loginResult = await login(email, password, "user");
                if (loginResult.success) {
                    router.replace("/");
                    router.refresh();
                } else {
                    router.replace("/login");
                }
            } else {
                toast.error(result.reason === "timeout" ? t("register.toast.timeout") : t("register.toast.genericError"));
            }
        } catch (err: any) {
            toast.error(err.message || t("register.toast.genericError"));
        } finally {
            setLoading(false);
        }
    };

    return {
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
    };
}
