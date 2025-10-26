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
import { authenticateAdmin, authenticateUser, completeAdminLoginWithOtp, Role, User } from "@/lib/auth/users";
import { authenticateUserWithPassword, getUserWithToken } from "@/lib/db";
import { toast } from "react-toastify";
import TwoFactorModal from "@/components/auth/TwoFactorModal";
import { AuthOtpChallengePayload, AuthUserPayload } from "@/types/auth";

/**
 * Auth context contract exposed to the app.
 */
type LoginFailureReason = "invalidCredentials" | "unexpectedError" | "requires2FA";

type OtpChallengeResult = {
  success: false;
  reason: "otpRequired";
  challenge: AuthOtpChallengePayload;
  username: string;
};

type LoginResult =
  | { success: true }
  | { success: false; reason: LoginFailureReason }
  | OtpChallengeResult;

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
    type?: "user" | "admin"
  ) => Promise<LoginResult>;
  verifyAdminOtp: (
    email: string,
    otpCode: string,
    otpToken: string,
    temporaryToken?: string
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

  const persistAuthenticatedSession = useCallback(
    ({ authToken, user }: { authToken: AuthUserPayload; user: User }) => {
      setUser(user);
      localStorage.setItem("authToken", authToken.token as string);
      localStorage.setItem("refreshToken", authToken.refreshToken as string);
      localStorage.setItem("csrfToken", authToken.csrfToken as string);

      const normalizedRole = user.role?.toString().toLowerCase();

      if (normalizedRole === "admin") {
        const cookieOptions = {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          expires: 7,
          path: "/",
        };
        Cookies.set(ADMIN_SESSION_COOKIE, authToken.token as string, cookieOptions);
        for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
          Cookies.set(legacyName, authToken.token as string, cookieOptions);
        }
      } else {
        Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
        for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
          Cookies.remove(legacyName, { path: "/" });
        }
      }
    },
    []
  );

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
      if (type === "admin") {
        const authenticated = await authenticateAdmin(email, password);

        if (!authenticated) {
          return { success: false, reason: "invalidCredentials" } as const;
        }

        if (authenticated.status === "otpRequired") {
          return {
            success: false,
            reason: "otpRequired",
            challenge: authenticated.challenge,
            username: email,
          } as const;
        }

        persistAuthenticatedSession(authenticated.auth);
        return { success: true } as const;
      }

      const authenticated = await authenticateUser(email, password);

      if (!authenticated) {
        return { success: false, reason: "invalidCredentials" } as const;
      }

      persistAuthenticatedSession(authenticated);

      return { success: true } as const;
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, reason: "unexpectedError" } as const;
    } finally {
      setAuthActionLoading(false);
    }
  }, [persistAuthenticatedSession]);

  const verifyAdminOtp = useCallback(
    async (
      email: string,
      otpCode: string,
      otpToken: string,
      temporaryToken?: string
    ) => {
      setAuthActionLoading(true);
      try {
        const authenticated = await completeAdminLoginWithOtp(
          email,
          otpCode,
          otpToken,
          temporaryToken
        );

        if (!authenticated) {
          return { success: false, reason: "invalidCredentials" } as const;
        }

        persistAuthenticatedSession(authenticated);
        return { success: true } as const;
      } catch (error) {
        console.error("Admin OTP verification failed:", error);
        return { success: false, reason: "unexpectedError" } as const;
      } finally {
        setAuthActionLoading(false);
      }
    },
    [persistAuthenticatedSession]
  );

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
      verifyAdminOtp,
      logout,
    }),
    [user, hydrating, authActionLoading, login, verifyAdminOtp, logout]
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
