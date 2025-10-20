"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import AuthProvider from "@/components/providers/auth-provider";
import { User } from "@/lib/auth/users";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
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
        return;
      }

      try {
        const fetchedUser = await getUserWithToken(storedToken);
        if (!cancelled) {
          setUser(fetchedUser);
          const normalizedRole = fetchedUser?.role?.toString().toLowerCase();

          if (normalizedRole === "admin") {
            Cookies.set(ADMIN_SESSION_COOKIE, storedToken, {
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              expires: 7,
              path: "/",
            });
          } else {
            Cookies.remove(ADMIN_SESSION_COOKIE, { path: "/" });
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
