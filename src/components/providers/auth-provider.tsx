"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { authenticateAdmin, authenticateUser, Role, User } from "@/lib/auth/users";

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
  login: (
    email: string,
    password: string,
    type?: "user" | "admin"
  ) => Promise<LoginResult>;
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
  user?: User | null;
};

/**
 * AuthProvider: wraps the application with authentication state.
 * - Hydrates initial state from localStorage (best-effort).
 * - Exposes login/logout helpers that update both memory state and localStorage.
 */
export default function AuthProvider({ children, user: initialUser }: Props) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * login: calls backend to authenticate using email+password.
   * On success, stores the returned user and persists it in localStorage.
   */
  const login = useCallback(async (email: string, password: string, type: "user" | "admin" = "user") => {
    setLoading(true);
    try {
      const authenticated = type === "admin"
        ? await authenticateAdmin(email, password)
        : await authenticateUser(email, password);

      if (!authenticated) {
        return { success: false, reason: "invalidCredentials" } as const;
      }

      setUser(authenticated.user);
      localStorage.setItem("authToken", authenticated.authToken.token);
      localStorage.setItem("refreshToken", authenticated.authToken.refreshToken);
      localStorage.setItem("csrfToken", authenticated.authToken.csrfToken);

      if (authenticated.user.role === "admin") {
        Cookies.set(ADMIN_SESSION_COOKIE, authenticated.authToken.token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: 7,
          path: "/",
        });
      } else {
        Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
      }

      return { success: true } as const;
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, reason: "unexpectedError" } as const;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * logout: clears user state and removes local cache.
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("csrfToken");
    Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
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
