"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authenticateAdmin, authenticateUser, Role, User } from "@/lib/auth/users";

/**
 * Auth context contract exposed to the app.
 */
type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  adminLogin: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
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
  

  /**
   * login: calls backend to authenticate using email+password.
   * On success, stores the returned user and persists it in localStorage.
   */
  const login = useCallback(async (email: string, password: string) => {
    const authenticated = await authenticateUser(email, password);

    if (!authenticated) {
      return {
        success: false,
        message: "E-posta veya şifre hatalı.",
      } as const;
    }

    setUser(authenticated.user);
    localStorage.setItem("authToken", authenticated.authToken.token);
    localStorage.setItem("refreshToken", authenticated.authToken.refreshToken);
    localStorage.setItem("csrfToken", authenticated.authToken.csrfToken);

    return { success: true } as const;
  }, []);
  
  const adminLogin = useCallback(async (email: string, password: string) => {
    const authenticated = await authenticateAdmin(email, password);

    if (!authenticated) {
      return {
        success: false,
        message: "E-posta veya şifre hatalı.",
      } as const;
    }

    setUser(authenticated.user);
    localStorage.setItem("authToken", authenticated.authToken.token);
    localStorage.setItem("refreshToken", authenticated.authToken.refreshToken);
    localStorage.setItem("csrfToken", authenticated.authToken.csrfToken);

    return { success: true } as const;
  }, []);

  /**
   * logout: clears user state and removes local cache.
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("csrfToken");
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      adminLogin,
      logout,
    }),
    [user, login, logout]
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
