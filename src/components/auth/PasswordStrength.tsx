"use client";

import { useTranslation } from "@tengra/language";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const { t } = useTranslation("Auth");

    const checks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const strength = Object.values(checks).filter(Boolean).length;

    if (!password) return null;

    const PasswordCheckItem = ({ passed, label }: { passed: boolean; label: string }) => (
        <div className={`flex items-center gap-2 text-xs ${passed ? "text-green-400" : "text-[var(--text-muted)]"}`}>
            {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {label}
        </div>
    );

    return (
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
                        className={`h-1 flex-1 rounded-full transition-colors ${strength >= level
                            ? strength <= 2
                                ? "bg-red-500"
                                : strength <= 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            : "bg-[rgba(72,213,255,0.1)]"
                            }`}
                    />
                ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-1">
                <PasswordCheckItem passed={checks.minLength} label={t("register.password.minLength")} />
                <PasswordCheckItem passed={checks.hasUppercase} label={t("register.password.uppercase")} />
                <PasswordCheckItem passed={checks.hasLowercase} label={t("register.password.lowercase")} />
                <PasswordCheckItem passed={checks.hasNumber} label={t("register.password.number")} />
            </div>
        </motion.div>
    );
}
