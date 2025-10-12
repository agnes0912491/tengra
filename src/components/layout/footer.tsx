"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import Img from "../../../public/tengra_without_text.png";
import LocaleSwitcher from "@/components/layout/locale-switcher";
import { useAuth } from "@/components/providers/auth-provider";
import { routing, type Locale } from "@/i18n/routing";

type NavLink = {
  href: string;
  labelKey: string;
};

const navLinks: NavLink[] = [
  { href: "/#goals", labelKey: "goals" },
  { href: "/#projects", labelKey: "projects" },
  { href: "/#network", labelKey: "network" },
  { href: "/#team", labelKey: "team" },
  { href: "/blogs", labelKey: "blogs" },
  { href: "/forum", labelKey: "forum" },
];

function localizeHref(locale: Locale, href: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  if (href.startsWith("/#")) {
    return `${prefix}${href}` || href;
  }
  return href;
}

export default function Footer() {
  const tFooter = useTranslations("Footer");
  const tNavigation = useTranslations("Navigation");
  const locale = useLocale() as Locale;
  const { user, isAuthenticated, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = useMemo(() => pathname?.startsWith("/admin"), [pathname]);

  const handleLogout = useCallback(() => {
    logout();
    toast.info(tFooter("logoutSuccess"));
    router.push(locale === routing.defaultLocale ? "/" : `/${locale}`);
  }, [locale, logout, router, tFooter]);

  if (isAdminRoute) {
    return (
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed bottom-0 left-0 z-50 w-full border-t border-[rgba(255,255,255,0.1)] bg-[rgba(6,20,26,0.78)] backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 text-center text-xs text-[rgba(255,255,255,0.55)]">
          {tFooter("copyright", { year: new Date().getFullYear() })} — {tFooter("admin")}
        </div>
      </motion.footer>
    );
  }

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed bottom-0 left-0 z-50 w-full border-t border-[rgba(255,255,255,0.1)] bg-[rgba(6,20,26,0.78)] backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 text-sm text-[color:var(--text-muted)]">
        <div className="hidden items-center justify-between gap-6 sm:flex">
          <div className="flex items-center gap-3">
            <Image src={Img.src} alt="Tengra" width={42} height={42} className="opacity-80" />
            <span className="font-display text-lg tracking-[0.4em] text-[color:var(--color-turkish-blue-400)] soft-glow">
              TENGRA
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={localizeHref(locale, link.href)}
                className="transition-colors hover:text-[color:var(--color-turkish-blue-300)]"
              >
                {tNavigation(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-xs text-[rgba(255,255,255,0.6)]">
            <span className="hidden text-[rgba(255,255,255,0.45)] md:inline">
              {tFooter("copyright", { year: new Date().getFullYear() })}
            </span>
            <LocaleSwitcher />
            {loading ? (
              <span className="text-[rgba(255,255,255,0.6)]">{tFooter("checking")}</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-[color:var(--color-turkish-blue-200)]">{user?.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[rgba(0,167,197,0.4)] px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
                >
                  {tFooter("logout")}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src={Img.src} alt="Tengra" width={30} height={30} className="opacity-80" />
              <span className="font-display text-sm tracking-[0.35em] text-[color:var(--color-turkish-blue-400)] soft-glow">
                TENGRA
              </span>
            </div>
            <span className="text-[10px] text-[rgba(255,255,255,0.45)]">
              {tFooter("copyright", { year: new Date().getFullYear() })}
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={localizeHref(locale, link.href)}
                className="transition-colors hover:text-[color:var(--color-turkish-blue-300)]"
              >
                {tNavigation(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-between text-[10px] text-[rgba(255,255,255,0.6)]">
            <LocaleSwitcher />
            {loading ? (
              <span>{tFooter("checking")}</span>
            ) : isAuthenticated ? (
              <>
                <span className="text-[color:var(--color-turkish-blue-200)]">{user?.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[rgba(0,167,197,0.35)] px-2 py-1 uppercase tracking-widest text-[0.6rem] text-[color:var(--color-turkish-blue-100)]"
                >
                  {tFooter("logoutShort")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-[rgba(0,167,197,0.35)] px-3 py-1 uppercase tracking-widest text-[0.6rem] text-[color:var(--color-turkish-blue-100)]"
              >
                {tFooter("login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
