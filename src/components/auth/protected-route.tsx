"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/auth/users";
import { useAuth } from "@/components/providers/auth-provider";
import { useTranslation } from "@tengra/language";

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
  // Client-side guard: redirects away if not authenticated or lacks the required role.
  // IMPORTANT: This is only a UX convenience. Server-side APIs must still validate
  // the Authorization header and enforce RBAC.
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation("ProtectedRoute");
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      const next = encodeURIComponent(window.location.pathname || "/admin/dashboard");
      router.replace(`/login?next=${next}`);
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [allowedRoles, isAuthenticated, loading, router, user]);

  if (loading) {
     return (
      <div className="w-full py-24 text-center text-sm text-[color:var(--color-turkish-blue-200)]">
        {t("authorization.loading")}
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
