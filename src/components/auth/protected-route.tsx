"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/auth/users";
import { useAuth } from "@/components/providers/auth-provider";

type Props = {
  children: React.ReactNode;
  allowedRoles?: Role[];
  fallback?: React.ReactNode;
};

export default function ProtectedRoute({
  children,
  allowedRoles = ["admin"],
  fallback = null,
}: Props) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [allowedRoles, isAuthenticated, loading, router, user]);

  if (loading) {
    return (
      <div className="w-full py-24 text-center text-sm text-[color:var(--color-turkish-blue-200)]">
        Yetkilendirme yükleniyor...
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
