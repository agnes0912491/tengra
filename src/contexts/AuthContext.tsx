"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { useTranslations } from "next-intl";

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
}

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

const STORAGE_KEYS = [AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, CSRF_TOKEN_KEY];
const t = useTranslations("AuthContext");
const DEFAULT_ERROR_MESSAGE = t("authorization.defaultErrorMessage");

const persistAuthPayload = (data: AuthSuccessPayload) => {
  if (!data) return;

  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(CSRF_TOKEN_KEY, data.csrfToken);

  Cookies.set(ADMIN_SESSION_COOKIE, data.token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: 7,
    path: "/",
  });
};

const clearStoredAuth = () => {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token invalid, clear it
        clearStoredAuth();
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      clearStoredAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

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
              : DEFAULT_ERROR_MESSAGE,
        };
      }

      const data = (await response.json()) as AuthResponse;

      if (!data.success) {
        return {
          success: false,
          message: data.message ?? DEFAULT_ERROR_MESSAGE,
        };
      }

      persistAuthPayload(data);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: DEFAULT_ERROR_MESSAGE };
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
      router.push("/admin/login");
    }
  };

  const refreshAuth = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      await fetchCurrentUser(token);
    }
  };

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
