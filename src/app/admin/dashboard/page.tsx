"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/components/providers/auth-provider";
import Logo from "../../../../public/tengra_without_text.png";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { getAllUsers } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { User } from "@/lib/auth/users";
import Cookies from "js-cookie";
import { routing } from "@/i18n/routing";
 

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";
  const t = useTranslations("AdminDashboard");
  const navigationLinks = useMemo(
    () => [
      {
        href: "/admin/dashboard#overview",
        label: t("navigation.overview"),
      },
      {
        href: "/admin/dashboard#projects",
        label: t("navigation.projects"),
      },
      {
        href: "/admin/dashboard#blogs",
        label: t("navigation.blogs"),
      },
      {
        href: "/admin/dashboard#users",
        label: t("navigation.users"),
      },
    ],
    [t]
  );

  const token = useCallback(async () => {
    const cookie = Cookies.get(ADMIN_SESSION_COOKIE);
    return cookie;
  }, []);

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        const tokenValue = await token();
        if (!tokenValue || cancelled) {
          return;
        }

        const users = await getAllUsers(tokenValue);
        if (!cancelled) {
          setAvailableUsers(users);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch admin users:", error);
          toast.error(t("toast.fetchUsersError"));
        }
      }
    };

    void fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [t, token]);

  const handleLogout = useCallback(() => {
    logout();
    toast.info(t("toast.logout"));
    router.push("/");
  }, [logout, router, t]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(0,167,197,0.18),rgba(4,15,20,0.92))] px-6">
        <div className="max-w-md rounded-xl border border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.65)] p-8 text-center backdrop-blur-xl shadow-[0_0_45px_rgba(0,0,0,0.25)]">
          <h1 className="text-2xl font-display tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">
            {t("unauthorizedAccess")}
          </h1>
          <p className="mt-4 text-sm text-gray-300">
            {t("unauthorizedMessage")}
          </p>
          <Link
            href="/admin/login"
            prefetch={false}
            className="mt-6 inline-block rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-2 text-sm text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
          >
            {t("goToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_top,rgba(0,167,197,0.18),rgba(4,15,20,0.92))]">
        <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col justify-between border-r border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.65)] px-6 py-8 backdrop-blur-xl shadow-[12px_0_45px_rgba(0,0,0,0.25)]">
          <header className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(0,167,197,0.35)] bg-[rgba(0,167,197,0.12)]">
              <Image
                src={Logo.src}
                alt="Tengra Logo"
                width={32}
                height={32}
                className="opacity-80"
              />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">
                Tengra
              </p>
              <p className="text-sm font-medium text-white">Yönetim Paneli</p>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-2 pt-10 text-sm">
            {navigationLinks.map((link) => {
              const basePath = link.href.split("#")[0];
              const isActive = pathname === basePath;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center rounded-xl px-4 py-3 font-medium transition ${
                    isActive
                      ? "bg-[rgba(8,25,32,0.65)] text-white shadow-[inset_4px_0_0_rgba(0,167,197,0.65)] backdrop-blur-md"
                      : "text-[rgba(255,255,255,0.65)] hover:bg-[rgba(8,25,32,0.4)] hover:text-white hover:shadow-[inset_4px_0_0_rgba(0,167,197,0.35)] hover:backdrop-blur-md"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </main>

          <footer className="border-t border-[rgba(0,167,197,0.2)] pt-6 text-xs text-[rgba(255,255,255,0.6)]">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">
              Kullanıcı
            </p>
            <p className="mt-1 text-sm font-medium text-white">{user?.name}</p>
            <p className="text-[11px] text-[rgba(255,255,255,0.45)]">
              {user?.email}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
            >
              Çıkış Yap
            </button>
          </footer>
        </aside>

        <section className="ml-72 flex flex-1 flex-col gap-8 px-8 py-16 md:px-16">
          <header>
            <h1 className="text-3xl font-display tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">
              Admin Paneli
            </h1>
            <p className="mt-4 text-sm text-gray-300">
              Hoş geldin{" "}
              <span className="font-semibold text-[color:var(--color-turkish-blue-200)]">
                {user?.name}
              </span>
              . Buradan stüdyo içeriklerini yönetebilir ve kısıtlı bölümlere
              erişebilirsin.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-[rgba(0,167,197,0.2)] bg-[rgba(3,14,18,0.7)] p-6">
              <h2 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">
                Hızlı İşlemler
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                <li className="rounded-lg border border-[rgba(0,167,197,0.1)] bg-[rgba(0,167,197,0.05)] p-3">
                  <p className="font-medium text-white">Projeleri Güncelle</p>
                  <p className="text-xs text-gray-400">
                    Ana sayfadaki proje kartlarını sadece adminler
                    düzenleyebilir.
                  </p>
                  <Link
                    href={`/${routing.defaultLocale}/#projects`}
                    className="mt-3 inline-flex items-center text-xs text-[color:var(--color-turkish-blue-200)] underline decoration-dotted underline-offset-2"
                  >
                    Projelere Git
                  </Link>
                </li>
                <li className="rounded-lg border border-[rgba(0,167,197,0.1)] bg-[rgba(0,167,197,0.05)] p-3">
                  <p className="font-medium text-white">Blog Yazısı Oluştur</p>
                  <p className="text-xs text-gray-400">
                    Blog sayfasındaki yönetim araçları yalnızca admin hesabıyla
                    görünür.
                  </p>
                  <Link
                    href={`/${routing.defaultLocale}/blogs`}
                    className="mt-3 inline-flex items-center text-xs text-[color:var(--color-turkish-blue-200)] underline decoration-dotted underline-offset-2"
                  >
                    Bloglara Git
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[rgba(0,167,197,0.2)] bg-[rgba(3,14,18,0.7)] p-6">
              <h2 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">
                Kullanıcı Rolleri
              </h2>
              <p className="mt-2 text-xs text-gray-400">
                Sistem, rollere göre yetkilendirme uygular. Admin hesabı tüm
                yönetim yetkilerine sahiptir.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-200">
                {availableUsers.map((availableUser) => (
                  <li
                    key={availableUser.id}
                    className="flex items-center justify-between rounded-lg border border-[rgba(0,167,197,0.1)] bg-[rgba(0,167,197,0.05)] px-4 py-2"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {availableUser.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {availableUser.email}
                      </p>
                    </div>
                    <span className="rounded-full border border-[rgba(0,167,197,0.3)] px-3 py-1 text-[10px] uppercase tracking-wider text-[color:var(--color-turkish-blue-200)]">
                      {availableUser.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
