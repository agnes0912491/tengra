"use client";

import { ReactNode, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/auth/protected-route";
import PublishListener from "@/components/admin/publish-listener";
import { useAuth } from "@/components/providers/auth-provider";
import { resolveCdnUrl } from "@/lib/constants";
const ADMIN_LOGO_SRC = resolveCdnUrl("/uploads/tengra_without_text.png");
import SidebarItem, { type NavItem } from "@/components/admin/navigation/sidebar-item";
import {
  LayoutDashboard,
  FolderKanban,
  BookText,
  HelpCircle,
  Target,
  Users,
  Palette,
} from "lucide-react";

const NAVIGATION_ITEMS: Readonly<NavItem[]> = [
  {
    href: "/admin/dashboard",
    label: "Genel Bakış",
    description: "Durum ve istatistikler",
    Icon: LayoutDashboard,
  },
  {
    href: "/admin/dashboard/projects",
    label: "Projeler",
    description: "Projeleri yönet",
    Icon: FolderKanban,
  },
  {
    href: "/admin/dashboard/blogs",
    label: "Bloglar",
    description: "Blog içeriklerini düzenle",
    Icon: BookText,
  },
  {
    href: "/admin/dashboard/goals",
    label: "Hedefler",
    description: "Hedefleri i18n ile yönet",
    Icon: Target,
  },
  {
    href: "/admin/dashboard/faq",
    label: "S.S.S.",
    description: "Sıkça sorulan soruları düzenle",
    Icon: HelpCircle,
  },
  {
    href: "/admin/dashboard/users",
    label: "Kullanıcılar",
    description: "Rolleri ve erişimi yönet",
    Icon: Users,
  },
  {
    href: "/admin/dashboard/design",
    label: "Tasarım Kontrolleri",
    description: "Site görünümünü yapılandır",
    Icon: Palette,
  },
];

type Props = {
  children: ReactNode;
};

export default function AdminShell({ children }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("AdminDashboard");
  const tNav = useTranslations("Navigation");

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

        <aside className="relative flex min-h-screen w-72 xl:w-80 flex-col justify-between bg-[rgba(5,16,22,0.6)] px-6 py-7 backdrop-blur-2xl" role="complementary" aria-label="Yönetim Paneli Yan Menü">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(110,211,225,0.16),transparent),linear-gradient(145deg,rgba(255,255,255,0.06),transparent_45%)]" />
          <header className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(110,211,225,0.35)] bg-[rgba(0,167,197,0.12)] shadow-[0_0_22px_rgba(0,167,197,0.4)]">
              <Image src={ADMIN_LOGO_SRC} alt="Tengra Logo" width={32} height={32} className="opacity-90" />
            </div>
            <div className="leading-tight text-[rgba(255,255,255,0.85)]">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">Tengra</p>
              <p className="text-sm font-semibold text-white">Yönetim Paneli</p>
            </div>
          </header>

          <nav className="relative mt-8 flex flex-1 flex-col gap-3 overflow-y-auto pr-1 text-sm" role="navigation" aria-label="Ana gezinme">
            {navigation.map((item) => {
              const localized = item.href === "/admin/dashboard/faq" ? { ...item, label: tNav("faq") } : item;
              const isActive = pathname === item.href;
              return <SidebarItem key={item.href} item={localized} isActive={!!isActive} />;
            })}
          </nav>

          <footer className="sticky bottom-0 left-0 w-full border-t border-[rgba(110,211,225,0.16)] pt-6 text-xs text-[rgba(255,255,255,0.7)]">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-[color:var(--text-invert)] bg-[color:var(--color-turkish-blue-500)] shadow-[var(--glow-soft)] hover:bg-[color:var(--color-turkish-blue-400)] hover:shadow-[var(--glow-strong)] transition"
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
              className="mt-4 flex w-full items-center justify-center rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white bg-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/90 shadow-[0_0_16px_rgba(207,63,75,0.45)] transition"
            >
              Çıkış Yap
            </button>
          </footer>
        </aside>

        <main className="relative ml-72 xl:ml-80 flex flex-1 flex-col px-8 py-16 md:px-16">
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
