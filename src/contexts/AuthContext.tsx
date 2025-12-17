"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ADMIN_SESSION_COOKIE,
  LEGACY_ADMIN_SESSION_COOKIES,
} from "@/lib/auth";
import { useTranslations } from "next-intl";

import { LovaUserAttributes as User } from "@tengra/types";

// Keep local types that extend or narrow the shared type if needed
// interface User extends LovaUserAttributes {} 

type LoginResult = {
  success: boolean;
  message?: string;
};

type AuthSuccessPayload = {
  success: true;
  token: string;
  refreshToken: string;
  csrfToken: string;
  user: User;
};

type AuthErrorPayload = {
  success: false;
  message?: string;
};

type AuthResponse = AuthSuccessPayload | AuthErrorPayload;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const CSRF_TOKEN_KEY = "csrfToken";

const STORAGE_KEYS = [
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  CSRF_TOKEN_KEY,
  "sessionToken",
  "user",
  "tengra:user",
  "tengra:auth",
];

const persistAuthPayload = (data: AuthSuccessPayload) => {
  if (!data) return;

  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(CSRF_TOKEN_KEY, data.csrfToken);

  // Determine domain for cookies to allow subdomain sharing
  const hostname = window.location.hostname;
  const isTengra = hostname.includes("tengra.studio");
  const domain = isTengra ? ".tengra.studio" : undefined;

  const cookieOptions = {
    secure: window.location.protocol === "https:",
    sameSite: "lax" as const, // 'lax' is better for cross-subdomain navigation than 'strict'
    expires: 7,
    path: "/",
    domain,
  };
  Cookies.set(ADMIN_SESSION_COOKIE, data.token, cookieOptions);
  for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
    Cookies.set(legacyName, data.token, cookieOptions);
  }
};

const clearStoredAuth = () => {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

  const hostname = window.location.hostname;
  const isTengra = hostname.includes("tengra.studio");
  const domain = isTengra ? ".tengra.studio" : undefined;

  // Clear cookies with domain
  Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/", domain });
  for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
    Cookies.remove(legacyName, { path: "/", domain });
  }
  // Also try clearing without domain just in case
  Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });

  sessionStorage.clear();
};

const decodeJwtExp = (token: string): number | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload && typeof payload.exp === "number") {
      return payload.exp;
    }
  } catch {
    // ignore malformed token
  }
  return null;
};

const isExpired = (token: string | null): boolean => {
  if (!token) return true;
  const exp = decodeJwtExp(token);
  if (!exp) return false;
  return exp * 1000 <= Date.now();
};

const purgeExpiredTokens = (): { clearedAuth: boolean } => {
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  if (authToken && isExpired(authToken)) {
    clearStoredAuth();
    return { clearedAuth: true };
  }

  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (refresh && isExpired(refresh)) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  const csrf = localStorage.getItem(CSRF_TOKEN_KEY);
  if (csrf && isExpired(csrf)) {
    localStorage.removeItem(CSRF_TOKEN_KEY);
  }

  return { clearedAuth: false };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations("AuthContext");
  const defaultErrorMessage = t("authorization.defaultErrorMessage");
  const handleInvalidAuth = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        handleInvalidAuth();
        return;
      }

      const data = await response.json().catch(() => null);
      const hasUser = data && typeof data === "object" && "user" in data && data.user;
      const successFlag = data && typeof data.success === "boolean" ? data.success : true;

      if (!hasUser || !successFlag) {
        handleInvalidAuth();
        return;
      }

      setUser((data as { user: User }).user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      handleInvalidAuth();
    } finally {
      setLoading(false);
    }
  }, [handleInvalidAuth]);

  useEffect(() => {
    // Hybrid Auth Sync:
    // 1. Try LocalStorage
    // 2. Fallback to Cookie (for subdomain sharing)
    // 3. Hydrate LocalStorage from Cookie if valid
    let token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      // Try to recover from cookie (Cross-Subdomain Support)
      const sessionCookie = Cookies.get(ADMIN_SESSION_COOKIE);
      if (sessionCookie && !isExpired(sessionCookie)) {
        token = sessionCookie;
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        // We don't have refresh/csrf from cookie alone, but auth token is enough to bootstrap Me call
        // Ideally backend would provide a mechanism to fully refresh session from just the token
      }
    }

    const { clearedAuth } = purgeExpiredTokens();

    // Re-read token in case purge cleared it (though purge checks localStorage)
    token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token && !clearedAuth && !isExpired(token)) {
      fetchCurrentUser(token);
    } else {
      clearStoredAuth();
      setUser(null);
      setLoading(false);
    }

    const interval = setInterval(() => {
      const result = purgeExpiredTokens();
      if (result.clearedAuth) {
        setUser(null);
        setLoading(false);
      }
    }, 5 * 60 * 1000);

    const handleStorage = () => {
      const auth = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!auth || isExpired(auth)) {
        clearStoredAuth();
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchCurrentUser]);



  const login = async (
    username: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return {
          success: false,
          message:
            response.status === 401
              ? t("authorization.invalidCredentials")
              : defaultErrorMessage,
        };
      }

      const data = (await response.json()) as AuthResponse;

      if (!data.success) {
        return {
          success: false,
          message: data.message ?? defaultErrorMessage,
        };
      }

      persistAuthPayload(data);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: defaultErrorMessage };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        await fetch(`${BACKEND_API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearStoredAuth();
      setUser(null);

      // Redirect to login
      router.push("/login");
    }
  };

  const refreshAuth = async () => {
    const { clearedAuth } = purgeExpiredTokens();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && !clearedAuth && !isExpired(token)) {
      await fetchCurrentUser(token);
    } else {
      clearStoredAuth();
      setUser(null);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      clearStoredAuth();
    }
  }, [loading, user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
