"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@tengra/language";

interface ThemeToggleProps {
    variant?: "icon" | "dropdown";
    className?: string;
}

export default function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
    const { t } = useTranslation("ThemeToggle");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (variant === "icon") {
        return (
            <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors hover:bg-[rgba(110,211,225,0.1)] ${className}`}
                title={resolvedTheme === "dark" ? t("switchToLight") : t("switchToDark")}
                aria-label={t("toggleTheme")}
            >
                {resolvedTheme === "dark" ? (
                    <Sun className="h-5 w-5 text-[rgba(255,255,255,0.7)] hover:text-white" />
                ) : (
                    <Moon className="h-5 w-5 text-[rgba(0,0,0,0.7)] hover:text-black" />
                )}
            </button>
        );
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-[rgba(110,211,225,0.1)]"
                aria-label={t("options")}
            >
                {resolvedTheme === "dark" ? (
                    <Moon className="h-5 w-5 text-[rgba(255,255,255,0.7)]" />
                ) : (
                    <Sun className="h-5 w-5 text-[rgba(0,0,0,0.7)]" />
                )}
                <span className="text-sm">
                    {theme === "system" ? t("system") : theme === "dark" ? t("dark") : t("light")}
                </span>
            </button>

            {showDropdown && (
                <div className="absolute right-0 top-full mt-2 py-2 w-40 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.95)] dark:bg-[rgba(6,20,27,0.95)] backdrop-blur-xl shadow-xl z-50">
                    <button
                        onClick={() => {
                            setTheme("light");
                            setShowDropdown(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[rgba(110,211,225,0.1)] ${theme === "light" ? "text-[rgba(0,167,197,1)]" : "text-[rgba(255,255,255,0.7)]"
                            }`}
                    >
                        <Sun className="h-4 w-4" />
                        {t("light")}
                        {theme === "light" && <span className="ml-auto text-xs">✓</span>}
                    </button>
                    <button
                        onClick={() => {
                            setTheme("dark");
                            setShowDropdown(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[rgba(110,211,225,0.1)] ${theme === "dark" ? "text-[rgba(0,167,197,1)]" : "text-[rgba(255,255,255,0.7)]"
                            }`}
                    >
                        <Moon className="h-4 w-4" />
                        {t("dark")}
                        {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
                    </button>
                    <button
                        onClick={() => {
                            setTheme("system");
                            setShowDropdown(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[rgba(110,211,225,0.1)] ${theme === "system" ? "text-[rgba(0,167,197,1)]" : "text-[rgba(255,255,255,0.7)]"
                            }`}
                    >
                        <Monitor className="h-4 w-4" />
                        {t("system")}
                        {theme === "system" && <span className="ml-auto text-xs">✓</span>}
                    </button>
                </div>
            )}
        </div>
    );
}
