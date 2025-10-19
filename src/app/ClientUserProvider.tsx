"use client";
import { useLocalStorage } from "usehooks-ts";
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
  const [token] = useLocalStorage("authToken", "");

  useEffect(() => {
    async function fetchUser() {
      if (token) {
        const fetchedUser = await getUserWithToken(token);
        setUser(fetchedUser);
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, [token]);

  return <AuthProvider user={user}>{children}</AuthProvider>;
}
