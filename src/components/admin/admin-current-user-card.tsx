"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

export default function AdminCurrentUserCard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logout();
    router.replace("/login");
    router.refresh();
  }, [logout, router]);

  const displayName = user?.displayName || user?.username || "—";
  const email = user?.email ?? "—";
  const role = user?.role ?? "—";

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div>
        <h2 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">Aktif Yönetici</h2>
        <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
          Dashboard yetkileri bu hesapla sınırlandırılmıştır.
        </p>

        <dl className="mt-6 space-y-4 text-sm text-[rgba(255,255,255,0.7)]">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.45)]">İsim</dt>
            <dd className="mt-1 text-base font-medium text-white">{displayName}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.45)]">E-posta</dt>
            <dd className="mt-1 break-all text-sm text-[rgba(255,255,255,0.6)]">{email}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.45)]">Rol</dt>
            <dd className="mt-1 inline-flex items-center rounded-full border border-[rgba(0,167,197,0.4)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-200)]">
              {role}
            </dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 w-full rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
      >
        Çıkış Yap
      </button>
    </div>
  );
}
