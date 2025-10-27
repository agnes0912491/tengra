"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import {
  ADMIN_SESSION_COOKIE,
  LEGACY_ADMIN_SESSION_COOKIES,
} from "@/lib/auth";
import { authenticateAdmin, authenticateUser, Role, User } from "@/lib/auth/users";
import { authenticateUserWithPassword, getUserWithToken } from "@/lib/db";
import { toast } from "react-toastify";
import TwoFactorModal from "@/components/auth/TwoFactorModal";
import { AuthUserPayload } from "@/types/auth";

/**
 * Auth context contract exposed to the app.
 */
type LoginFailureReason = "invalidCredentials" | "unexpectedError" | "requires2FA";

type LoginResult =
  | { success: true }
  | { success: false; reason: LoginFailureReason } | { success: true; }

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
  hydrating?: boolean;
};

/**
 * AuthProvider: wraps the application with authentication state.
 * - Hydrates initial state from localStorage (best-effort).
 * - Exposes login/logout helpers that update both memory state and localStorage.
 */
export default function AuthProvider({
  children,
  user: initialUser,
  hydrating = false,
}: Props) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [authActionLoading, setAuthActionLoading] = useState<boolean>(false);
  const [pendingTempToken, setPendingTempToken] = useState<string | null>(null);
  const [pendingExpirySeconds, setPendingExpirySeconds] = useState<number | null>(null);
  const pendingResolveRef = useRef<((payload: AuthUserPayload) => void) | null>(null);
  const pendingRejectRef = useRef<((reason?: unknown) => void) | null>(null);

  useEffect(() => {
    if (initialUser === undefined) {
      return;
    }

    setUser((prev) => {
      if (prev?.id === initialUser?.id) {
        return prev;
      }

      return initialUser ?? null;
    });
  }, [initialUser]);

  /**
   * login: calls backend to authenticate using email+password.
   * On success, stores the returned user and persists it in localStorage.
   */
  const login = useCallback(async (email: string, password: string, type: "user" | "admin" = "user") => {
    setAuthActionLoading(true);
    try {
      // Use low-level password authentication to detect 2FA requirement
      const payload = await authenticateUserWithPassword(email, password);
      if (!payload) {
        return { success: false, reason: "invalidCredentials" } as const;
      }

      if (payload.requires2FA && payload.tempToken) {
        // Register a finalizer that the modal will call when verification succeeds.
        pendingResolveRef.current = async (verifiedPayload: AuthUserPayload) => {
          // Persist tokens and load user
          if (!verifiedPayload.token) {
            // nothing to do
            return;
          }

          try {
            console.log("[AuthProvider] finalizing 2FA, payload:", verifiedPayload);

            // Persist the tokens first (some codepaths may read from storage/cookies)
            localStorage.setItem("authToken", verifiedPayload.token);
            if (verifiedPayload.refreshToken) localStorage.setItem("refreshToken", verifiedPayload.refreshToken);
            if (verifiedPayload.csrfToken) localStorage.setItem("csrfToken", verifiedPayload.csrfToken);

            // Tokens persisted to localStorage above. We'll derive the user's role
            // after fetching the user and set cookies accordingly below.

            // Now attempt to load the user with the token. Logging results helps
            // diagnose why the dashboard navigation may not trigger.
            const userObj = await getUserWithToken(verifiedPayload.token);
            console.log("[AuthProvider] getUserWithToken result:", userObj);

            if (!userObj) {
              // If we couldn't fetch the user, surface a helpful toast and keep the tokens
              // persisted so the user can retry or refresh the page.
              toast.error("Doğrulama başarılı, fakat kullanıcı bilgisi alınamadı. Lütfen sayfayı yenileyin veya tekrar giriş yapın.");
              return;
            }

            setUser(userObj);

            // If the role wasn't set via payload earlier, ensure cookies are consistent
            const normalizedRole = userObj.role?.toString().toLowerCase();
            if (normalizedRole === "admin") {
              const cookieOptions = {
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict" as const,
                expires: 7,
                path: "/",
              };
              Cookies.set(ADMIN_SESSION_COOKIE, verifiedPayload.token, cookieOptions);
              for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
                Cookies.set(legacyName, verifiedPayload.token, cookieOptions);
              }
            } else {
              Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
              for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
                Cookies.remove(legacyName, { path: "/" });
              }
            }
          } catch (err) {
            console.error("[AuthProvider] error finalizing 2FA:", err);
            toast.error("Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.");
          } finally {
            // clear refs
            pendingResolveRef.current = null;
            pendingRejectRef.current = null;
            setPendingTempToken(null);
          }
        };

        // Show modal to the user and return a special result so callers don't treat this as invalid credentials
        setPendingTempToken(payload.tempToken);
        // Calculate seconds remaining from server-provided expiresAt when available
        if (payload.expiresAt) {
          const nowSec = Math.floor(Date.now() / 1000);
          const secs = Math.max(1, Math.floor(payload.expiresAt - nowSec));
          setPendingExpirySeconds(secs);
        } else {
          setPendingExpirySeconds(payload.expiresIn ?? 300);
        }
        return { success: false, reason: "requires2FA" } as const;
      }

      // Fallback to earlier higher-level flow
      if (type === "admin") {
        const adminResult = await authenticateAdmin(email, password);
        if (!adminResult) return { success: false, reason: "invalidCredentials" } as const;

        if ("status" in adminResult) {
          if (adminResult.status === "otpRequired") {
            return { success: false, reason: "requires2FA" } as const;
          }
          if (adminResult.status === "authenticated") {
            const auth = adminResult.auth;
            setUser(auth.user);
            const token = auth.authToken?.token;
            if (!token) return { success: false, reason: "unexpectedError" } as const;
            localStorage.setItem("authToken", token);
            if (auth.authToken.refreshToken) localStorage.setItem("refreshToken", auth.authToken.refreshToken);
            if (auth.authToken.csrfToken) localStorage.setItem("csrfToken", auth.authToken.csrfToken);

            const normalizedRole = auth.user.role?.toString().toLowerCase();
            if (normalizedRole === "admin") {
              const cookieOptions = {
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict" as const,
                expires: 7,
                path: "/",
              };
              Cookies.set(ADMIN_SESSION_COOKIE, token, cookieOptions);
              for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
                Cookies.set(legacyName, token, cookieOptions);
              }
            } else {
              Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
              for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
                Cookies.remove(legacyName, { path: "/" });
              }
            }

            return { success: true } as const;
          }
        }

        return { success: false, reason: "unexpectedError" } as const;
      } else {
        const userResult = await authenticateUser(email, password);
        if (!userResult) return { success: false, reason: "invalidCredentials" } as const;

        setUser(userResult.user);
        const token = userResult.authToken.token;
        if (!token) return { success: false, reason: "unexpectedError" } as const;
        localStorage.setItem("authToken", token);
        if (userResult.authToken.refreshToken) localStorage.setItem("refreshToken", userResult.authToken.refreshToken);
        if (userResult.authToken.csrfToken) localStorage.setItem("csrfToken", userResult.authToken.csrfToken);

        const normalizedRole = userResult.user.role?.toString().toLowerCase();
        if (normalizedRole === "admin") {
          const cookieOptions = {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            expires: 7,
            path: "/",
          };
          Cookies.set(ADMIN_SESSION_COOKIE, token, cookieOptions);
          for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
            Cookies.set(legacyName, token, cookieOptions);
          }
        } else {
          Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
          for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
            Cookies.remove(legacyName, { path: "/" });
          }
        }

        return { success: true } as const;
      }

    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, reason: "unexpectedError" } as const;
    } finally {
      setAuthActionLoading(false);
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
    for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
      Cookies.remove(legacyName, { path: "/" });
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading: hydrating || authActionLoading,
      login,
      logout,
    }),
    [user, hydrating, authActionLoading, login, logout]
  );

  const handleTwoFactorSuccess = (payload: AuthUserPayload) => {
    if (pendingResolveRef.current) {
      pendingResolveRef.current(payload);
    }
    pendingResolveRef.current = null;
    pendingRejectRef.current = null;
    setPendingTempToken(null);
    setPendingExpirySeconds(null);
  };

  return (
    <>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      {pendingTempToken && (
        <TwoFactorModal tempToken={pendingTempToken} expirySeconds={pendingExpirySeconds ?? 300} onSuccess={handleTwoFactorSuccess} />
      )}
    </>
  );
}

/**
 * useHasRole: convenience helper to check a single role on the current user.
 */
export function useHasRole(role: Role) {
  const { user } = useAuth();
  return user?.role === role;
}
