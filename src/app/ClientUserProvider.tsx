"use client";
import { useEffect, useState } from "react";
import { User } from "@/lib/auth/users";
import { getUserWithToken } from "@/lib/db";
import AuthProvider from "@/components/providers/auth-provider";

export default function ClientUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token from localStorage (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // authToken is a plain string (JWT), not JSON
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to read authToken from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user when token changes
  useEffect(() => {
    if (isLoading) return;

    async function fetchUser() {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const fetchedUser = await getUserWithToken(token);
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user with token:", error);
        // Clear invalid tokens
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("csrfToken");
        setUser(null);
        setToken("");
      }
    }

    fetchUser();
  }, [token, isLoading]);

  return <AuthProvider user={user}>{children}</AuthProvider>;
}