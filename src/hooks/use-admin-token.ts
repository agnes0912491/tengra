"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";

/**
 * Centralized admin token resolver.
 * - Reads from localStorage (authToken) and known admin cookies.
 * - Updates when storage changes across tabs.
 */
export function useAdminToken() {
  const readToken = useCallback(() => {
    if (typeof window === "undefined") return "";
    const fromStorage = window.localStorage.getItem("authToken") || "";
    if (fromStorage) return fromStorage;
    const fromCookies = ADMIN_SESSION_COOKIE_CANDIDATES.map((name) => Cookies.get(name)).find(Boolean);
    return fromCookies || "";
  }, []);

  // Initialize with the token value directly (lazy initializer runs once on mount)
  const [token, setToken] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const fromStorage = window.localStorage.getItem("authToken") || "";
    if (fromStorage) return fromStorage;
    const fromCookies = ADMIN_SESSION_COOKIE_CANDIDATES.map((name) => Cookies.get(name)).find(Boolean);
    return fromCookies || "";
  });

  const refresh = useCallback(() => {
    const next = readToken();
    setToken(next);
    return next;
  }, [readToken]);

  useEffect(() => {
    // Only subscribe to storage events, don't call setState on mount
    const onStorage = (event: StorageEvent) => {
      if (event.key === "authToken") {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  // Stable shape to avoid re-renders when token unchanged
  return useMemo(() => ({ token, refresh }), [token, refresh]);
}
