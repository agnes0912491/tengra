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
import { useTranslation } from "@tengra/language";
import { api } from "@/lib/api";

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
const COOKIE_NAME = "authToken";
const COOKIE_EXPIRES_DAYS = 30;

const setAuthCookie = (token: string) => {
  const hostname = window.location.hostname;
  // Support for main domain and subdomains (e.g. tengra.studio, lova.tengra.studio)
  // If we are on a subdomain of tengra.studio, set domain to .tengra.studio
  const isTengra = hostname.includes("tengra.studio");
  const domain = isTengra ? ".tengra.studio" : undefined;

  const cookieOptions: Cookies.CookieAttributes = {
    secure: window.location.protocol === "https:",
    sameSite: "lax",
    expires: COOKIE_EXPIRES_DAYS,
    path: "/",
    domain,
  };

  Cookies.set(COOKIE_NAME, token, cookieOptions);

  // Also set legacy cookies for admin panel compatibility if needed
  Cookies.set(ADMIN_SESSION_COOKIE, token, cookieOptions);
  for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
    Cookies.set(legacyName, token, cookieOptions);
  }
};

const clearAuthCookie = () => {
  const hostname = window.location.hostname;
  const isTengra = hostname.includes("tengra.studio");
  const domain = isTengra ? ".tengra.studio" : undefined;

  const options = { path: "/", domain };

  Cookies.remove(COOKIE_NAME, options);
  Cookies.remove(ADMIN_SESSION_COOKIE, options);
  for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
    Cookies.remove(legacyName, options);
  }

  // Also try removing without domain as fallback
  Cookies.remove(COOKIE_NAME, { path: "/" });
  Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
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

const getValidToken = (): string | null => {
  const token = Cookies.get(COOKIE_NAME);
  if (!token) return null;
  if (isExpired(token)) {
    clearAuthCookie();
    return null;
  }
  return token;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation("AuthContext");
  const defaultErrorMessage = t("authorization.defaultErrorMessage");
  const handleInvalidAuth = useCallback(() => {
    clearAuthCookie();
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const response = await api.get("/auth/me", {
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

      // Handle both wrapped { user: ... } and direct User object responses
      let fetchedUser: User | null = null;
      if (data && typeof data === "object") {
        if ("user" in data && data.user) {
          fetchedUser = data.user;
        } else if ("id" in data && "email" in data) {
          fetchedUser = data as User;
        }
      }

      if (!fetchedUser) {
        console.warn("[Auth] /me endpoint returned invalid data, clearing session", data);
        handleInvalidAuth();
        return;
      }

      setUser(fetchedUser);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      handleInvalidAuth();
    } finally {
      setLoading(false);
    }
  }, [handleInvalidAuth]);

  useEffect(() => {
    // Cookie-only auth flow
    const token = getValidToken();
    console.log("[AuthContext] useEffect triggered. Token found:", !!token);

    if (token) {
      console.log("[AuthContext] Token valid, fetching current user...");
      fetchCurrentUser(token);
    } else {
      console.log("[AuthContext] No valid token found, clearing user.");
      setUser(null);
      setLoading(false);
    }

    // Periodic check for token expiry
    const interval = setInterval(() => {
      const token = getValidToken(); // This clears cookie if expired
      if (!token && user) {
        setUser(null);
        setLoading(false);
      }
    }, 60 * 1000); // Check every minute

    return () => {
      clearInterval(interval);
    };
  }, [fetchCurrentUser, user]);



  const login = async (
    username: string,
    password: string,
    retryCount = 0
  ): Promise<LoginResult> => {
    const MAX_RETRIES = 2;

    try {
      const response = await api.post("/auth/login", { username, password });

      if (!response.ok) {
        // Check if it's a network error worth retrying
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          console.warn(`Server error (${response.status}), retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return login(username, password, retryCount + 1);
        }

        return {
          success: false,
          message:
            response.status === 401
              ? t("authorization.invalidCredentials")
              : response.status >= 500
                ? t("authorization.serverError") || "Server error, please try again"
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

      setAuthCookie(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);

      // Retry on network errors
      if (retryCount < MAX_RETRIES && error instanceof TypeError) {
        console.warn(`Network error, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return login(username, password, retryCount + 1);
      }

      return {
        success: false,
        message: t("authorization.networkError") || "Network error, please check your connection"
      };
    }
  };

  const logout = async () => {
    try {
      const token = getValidToken();
      if (token) {
        await api.post("/auth/logout", null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthCookie();
      setUser(null);

      // Redirect to login
      router.push("/login");
    }
  };

  const refreshAuth = async () => {
    const token = getValidToken();
    if (token) {
      await fetchCurrentUser(token);
    } else {
      clearAuthCookie();
      setUser(null);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      clearAuthCookie();
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
