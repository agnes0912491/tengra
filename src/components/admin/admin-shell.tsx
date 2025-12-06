"use client";

import { ReactNode, useMemo, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
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
  Mail,
  Home,
  LogOut,
  Menu,
  X,
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
    href: "/admin/dashboard/contact",
    label: "İletişim",
    description: "İletişim formu kayıtları",
    Icon: Mail,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const navigation = useMemo(() => NAVIGATION_ITEMS, []);

  const handleLogout = useCallback(() => {
    logout();
    toast.info(t("toast.logout"));
    router.push("/");
  }, [logout, router, t]);

  if (!isAdmin) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--color-background)] px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.08)_0%,transparent_60%)]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md rounded-2xl border border-[rgba(72,213,255,0.15)] bg-[rgba(15,31,54,0.7)] p-8 text-center backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(30,184,255,0.08)]"
        >
          <h1 className="text-2xl font-display font-bold tracking-wider text-[var(--text-primary)]">
            {t("unauthorizedAccess")}
          </h1>
          <p className="mt-4 text-sm text-[var(--text-muted)]">{t("unauthorizedMessage")}</p>
          <Link
            href="/login?next=/admin/dashboard"
            prefetch={false}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(72,213,255,0.2)] bg-[rgba(30,184,255,0.1)] px-5 py-2.5 text-sm font-medium text-[var(--color-turkish-blue-300)] transition hover:bg-[rgba(30,184,255,0.15)] hover:border-[rgba(72,213,255,0.3)]"
          >
            {t("goToLogin")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen w-full overflow-hidden bg-[var(--color-background)]">
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-[rgba(15,31,54,0.8)] border border-[rgba(72,213,255,0.15)] backdrop-blur-xl"
        >
          <Menu className="w-5 h-5 text-[var(--color-turkish-blue-300)]" />
        </button>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative inset-y-0 left-0 z-50 flex min-h-screen w-72 xl:w-80 flex-col justify-between
            bg-[rgba(8,20,32,0.95)] border-r border-[rgba(72,213,255,0.08)] px-6 py-7 backdrop-blur-xl
            transform transition-transform duration-300 lg:transform-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          role="complementary"
          aria-label="Yönetim Paneli Yan Menü"
        >
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] lg:hidden"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          {/* Header */}
          <header className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] shadow-[0_4px_20px_rgba(30,184,255,0.25)]">
              <Image crossOrigin="anonymous" src={ADMIN_LOGO_SRC} alt="Tengra Logo" width={28} height={28} className="opacity-95" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-turkish-blue-400)]">
                Tengra
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Yönetim Paneli</p>
            </div>
          </header>

          {/* Navigation */}
          <nav className="relative mt-8 flex flex-1 flex-col gap-2 overflow-y-auto pr-1 text-sm" role="navigation" aria-label="Ana gezinme">
            {navigation.map((item) => {
              const localized =
                item.href === "/admin/dashboard/faq"
                  ? { ...item, label: tNav("faq") }
                  : item.href === "/admin/dashboard/contact"
                    ? { ...item, label: tNav("contact") }
                    : item;
              const isActive = pathname === item.href;
              return <SidebarItem key={item.href} item={localized} isActive={!!isActive} />;
            })}
          </nav>

          {/* Footer */}
          <footer className="sticky bottom-0 left-0 w-full border-t border-[rgba(72,213,255,0.1)] pt-6 text-xs">
            <Link
              href="/"
              className="mb-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] hover:from-[var(--color-turkish-blue-400)] hover:to-[var(--color-turkish-blue-500)] shadow-[0_4px_15px_rgba(30,184,255,0.2)] transition-all"
            >
              <Home className="h-4 w-4" />
              Ana Sayfaya Dön
            </Link>

            <div className="rounded-xl bg-[rgba(15,31,54,0.5)] border border-[rgba(72,213,255,0.1)] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-turkish-blue-400)]">
                Kullanıcı
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{user?.displayName ?? user?.username ?? "Admin"}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{user?.email}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-[rgba(220,38,38,0.8)] hover:bg-[rgba(220,38,38,0.9)] shadow-[0_4px_15px_rgba(220,38,38,0.2)] transition-all"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </footer>
        </aside>

        {/* Main Content */}
        <main className="relative flex flex-1 flex-col px-6 py-8 lg:px-12 lg:py-12 bg-[var(--color-background)]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
            {children}
            <PublishListener />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
