"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "tengra-theme";

const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredTheme = (): Theme => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) || "system";
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => getSystemTheme());
    const resolvedTheme = theme === "system" ? systemTheme : theme;

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, newTheme);
        }
    };

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolvedTheme);
        root.style.colorScheme = resolvedTheme;
    }, [resolvedTheme]);

    return (
        <>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            (function() {
              try {
                var stored = localStorage.getItem('${STORAGE_KEY}');
                var theme = stored || 'system';
                var resolved = theme;
                if (theme === 'system') {
                  resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.classList.add(resolved);
                document.documentElement.style.colorScheme = resolved;
              } catch (e) {}
            })();
          `,
                }}
            />
            <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
                {children}
            </ThemeContext.Provider>
        </>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
