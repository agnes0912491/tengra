"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import AuthProvider from "@/components/providers/auth-provider";
import { WebSocketProvider } from "@/components/providers/websocket-provider";
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
        if (!storedToken) {
          storedToken = Cookies.get("authToken") || null;
          if (storedToken) {
            console.log("Found authToken in cookies, syncing to localStorage");
            window.localStorage.setItem("authToken", storedToken);
          }
        }
      } catch (error) {
        console.error("Failed to read authToken from storage:", error);
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
            console.warn("No user found with stored token. Clearing invalid tokens...");
            // Clear invalid tokens from localStorage
            window.localStorage.removeItem("authToken");

            // Clear cookies with all possible domain variations (retry 3 times for each)
            const hostname = window.location.hostname;
            const isTengra = hostname.includes("tengra.studio");
            const domains = isTengra ? [".tengra.studio", "tengra.studio", undefined] : [undefined];

            for (let attempt = 0; attempt < 3; attempt++) {
              for (const domain of domains) {
                const opts = domain ? { path: "/", domain } : { path: "/" };
                Cookies.remove("authToken", opts);
                Cookies.remove("admin_session", opts);
                Cookies.remove(ADMIN_SESSION_COOKIE, opts);
                for (const legacyName of LEGACY_ADMIN_SESSION_COOKIES) {
                  Cookies.remove(legacyName, opts);
                }
              }
            }
            console.log("Invalid tokens cleared.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user with token:", error);
        if (typeof window !== "undefined") {
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
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </AuthProvider>
  );
}
