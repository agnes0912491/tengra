"use client";

import { ReactNode, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/protected-route";
import PublishListener from "@/components/admin/publish-listener";
import { useAuth } from "@/components/providers/auth-provider";
import Logo from "../../../public/tengra_without_text.png";

const NAVIGATION_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Genel Bakış",
    description: "Durum ve istatistikler",
  },
  {
    href: "/admin/dashboard/projects",
    label: "Projeler",
    description: "Projeleri yönet",
  },
  {
    href: "/admin/dashboard/blogs",
    label: "Bloglar",
    description: "Blog içeriklerini düzenle",
  },
  {
    href: "/admin/dashboard/faq",
    label: "S.S.S.",
    description: "Sıkça sorulan soruları düzenle",
  },
  {
    href: "/admin/dashboard/users",
    label: "Kullanıcılar",
    description: "Rolleri ve erişimi yönet",
  },
  {
    href: "/admin/dashboard/design",
    label: "Tasarım Kontrolleri",
    description: "Site görünümünü yapılandır",
  },
] as const;

type Props = {
  children: ReactNode;
};

export default function AdminShell({ children }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("AdminDashboard");

  const isAdmin = user?.role === "admin";

  const navigation = useMemo(() => NAVIGATION_ITEMS, []);

  const handleLogout = useCallback(() => {
    logout();
    toast.info(t("toast.logout"));
    router.push("/");
  }, [logout, router, t]);

  if (!isAdmin) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(0,167,197,0.18),rgba(4,15,20,0.92))] px-6">
        <div className="absolute inset-0 -z-10">
          <div className="admin-starfield" />
        </div>
        <div className="max-w-md rounded-2xl border border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.7)] p-8 text-center backdrop-blur-2xl shadow-[0_0_55px_rgba(0,0,0,0.35)]">
          <h1 className="text-2xl font-display tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">
            {t("unauthorizedAccess")}
          </h1>
          <p className="mt-4 text-sm text-gray-300">{t("unauthorizedMessage")}</p>
          <Link
            href="/admin/login"
            prefetch={false}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-2 text-sm text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
          >
            {t("goToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(0,167,197,0.16),rgba(4,15,20,0.92))]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="admin-starfield" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(110,211,225,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(0,151,178,0.18),transparent_60%)]" />
        </div>

        <aside className="static flex min-h-screen w-72 flex-col justify-between border-r border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.55)]/90 px-6 py-8 shadow-[12px_0_55px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="absolute inset-0 -z-10 rounded-r-3xl bg-[linear-gradient(145deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.02)_45%,rgba(0,167,197,0.08)_100%)] opacity-70" />
          <header className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(110,211,225,0.35)] bg-[rgba(0,167,197,0.12)] shadow-[0_0_22px_rgba(0,167,197,0.4)]">
              <Image src={Logo.src} alt="Tengra Logo" width={32} height={32} className="opacity-90" />
            </div>
            <div className="leading-tight text-[rgba(255,255,255,0.85)]">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">Tengra</p>
              <p className="text-sm font-semibold text-white">Yönetim Paneli</p>
            </div>
          </header>

          <nav className="relative mt-10 flex flex-1 flex-col gap-2 text-sm">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex flex-col rounded-2xl border border-transparent px-4 py-3 transition",
                    "hover:border-[rgba(110,211,225,0.45)] hover:bg-[rgba(10,32,40,0.55)] hover:shadow-[0_10px_40px_rgba(0,167,197,0.25)]",
                    isActive
                      ? "border-[rgba(110,211,225,0.55)] bg-[rgba(10,40,52,0.65)] shadow-[0_15px_45px_rgba(0,167,197,0.3)]"
                      : "border-transparent"
                  )}
                >
                  <span className="text-sm font-medium text-white">{item.label}</span>
                  <span className="text-[11px] text-[rgba(255,255,255,0.55)]">
                    {item.description}
                  </span>
                  <span
                    className={cn(
                      "pointer-events-none absolute -left-0.5 top-1/2 h-3/4 w-[1.5px] -translate-y-1/2 rounded-full",
                      "bg-gradient-to-b from-transparent via-[rgba(110,211,225,0.65)] to-transparent opacity-0 transition",
                      isActive ? "opacity-100" : "group-hover:opacity-70"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <footer className="relative border-t border-[rgba(110,211,225,0.2)] pt-6 text-xs text-[rgba(255,255,255,0.7)]">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(0,167,197,0.08)] px-4 py-2 text-sm text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.15)]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ana Sayfaya Dön
            </Link>

            <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">Kullanıcı</p>
            <p className="mt-1 text-sm font-medium text-white">{user?.displayName ?? user?.username ?? "Admin"}</p>
            <p className="text-[11px] text-[rgba(255,255,255,0.55)]">{user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center rounded-full border border-[rgba(110,211,225,0.4)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
            >
              Çıkış Yap
            </button>
          </footer>
        </aside>

        <main className="relative ml-72 flex flex-1 flex-col px-8 py-16 md:px-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="admin-starfield" />
          </div>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
            {children}
            <PublishListener />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
