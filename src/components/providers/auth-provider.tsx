"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authenticateUser, Role, User } from "@/lib/auth/users";

const STORAGE_KEY = "tengra.auth.user";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
      } catch (error) {
        console.warn("Stored kullanıcı verisi okunamadı:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const authenticated = authenticateUser(email, password);

    if (!authenticated) {
      return {
        success: false,
        message: "E-posta veya şifre hatalı.",
      } as const;
    }

    setUser(authenticated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticated));

    return { success: true } as const;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useHasRole(role: Role) {
  const { user } = useAuth();
  return user?.role === role;
}
