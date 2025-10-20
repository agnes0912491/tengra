"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import AuthProvider from "@/components/providers/auth-provider";
import { User } from "@/lib/auth/users";
import {
  ADMIN_SESSION_COOKIE,
  LEGACY_ADMIN_SESSION_COOKIES,
} from "@/lib/auth";
import { getUserWithToken } from "@/lib/db";

export default function ClientUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrateUserFromStorage() {
      if (typeof window === "undefined") {
        return;
      }

      let storedToken: string | null = null;
      try {
        storedToken = window.localStorage.getItem("authToken");
      } catch (error) {
        console.error("Failed to read authToken from localStorage:", error);
        window.localStorage.removeItem("authToken");
      }

      if (!storedToken) {
        if (!cancelled) {
          setUser(null);
          setHydrating(false);
        }
        Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
        for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
          Cookies.remove(legacyName, { path: "/" });
        }
        return;
      }

      try {
        const fetchedUser = await getUserWithToken(storedToken);
        if (!cancelled) {
          setUser(fetchedUser);
          const normalizedRole = fetchedUser?.role?.toString().toLowerCase();

          if (normalizedRole === "admin") {
            const cookieOptions = {
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict" as const,
              expires: 7,
              path: "/",
            };
            Cookies.set(ADMIN_SESSION_COOKIE, storedToken, cookieOptions);
            for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
              Cookies.set(legacyName, storedToken, cookieOptions);
            }
          } else {
            Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
            for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
              Cookies.remove(legacyName, { path: "/" });
            }
          }
          if (!fetchedUser && typeof window !== "undefined") {
            window.localStorage.removeItem("authToken");
            window.localStorage.removeItem("refreshToken");
            window.localStorage.removeItem("csrfToken");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user with token:", error);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("authToken");
          window.localStorage.removeItem("refreshToken");
          window.localStorage.removeItem("csrfToken");
        }
        Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
        for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
          Cookies.remove(legacyName, { path: "/" });
        }
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setHydrating(false);
        }
      }
    }

    hydrateUserFromStorage();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthProvider user={user} hydrating={hydrating}>
      {children}
    </AuthProvider>
  );
}
