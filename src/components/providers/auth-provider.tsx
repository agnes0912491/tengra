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

/**
 * LocalStorage key where we store the authenticated user snapshot.
 * This is a lightweight cache used purely for client-side rendering convenience.
 * In production, prefer server-issued HttpOnly cookies for session state.
 */
const STORAGE_KEY = "tengra.auth.user";

/**
 * Auth context contract exposed to the app.
 */
type LoginFailureReason = "invalidCredentials" | "unexpectedError";

type LoginResult =
  | { success: true }
  | { success: false; reason: LoginFailureReason };

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * useAuth: React hook to read the authentication state from context.
 * Throws if used outside of the AuthProvider tree.
 */
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

/**
 * AuthProvider: wraps the application with authentication state.
 * - Hydrates initial state from localStorage (best-effort).
 * - Exposes login/logout helpers that update both memory state and localStorage.
 */
export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read any previously saved user snapshot. This is optional and
    // only improves initial paint; real authorization should be verified
    // on the server when accessing protected resources.
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

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

  /**
   * login: calls backend to authenticate using email+password.
   * On success, stores the returned user and persists it in localStorage.
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const authenticated = await authenticateUser(email, password);

      if (!authenticated) {
        return { success: false, reason: "invalidCredentials" } as const;
      }

      setUser(authenticated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticated));

      return { success: true } as const;
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, reason: "unexpectedError" } as const;
    }
  }, []);

  /**
   * logout: clears user state and removes local cache.
   */
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

/**
 * useHasRole: convenience helper to check a single role on the current user.
 */
export function useHasRole(role: Role) {
  const { user } = useAuth();
  return user?.role === role;
}
