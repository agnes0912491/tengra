"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { routing, type Locale } from "@/i18n/routing";

type HeaderLink = {
  href: string;
  labelKey: string;
};

const headerLinks: HeaderLink[] = [
  { href: "/", labelKey: "home" },
  { href: "/blogs", labelKey: "blogs" },
];

function localizeHome(locale: Locale) {
  return locale === routing.defaultLocale ? "/" : `/${locale}`;
}

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslations("Header");
  const locale = useLocale() as Locale;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[rgba(3,12,18,0.6)] border-b border-[rgba(0,167,197,0.15)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm">
        <Link href={localizeHome(locale)} className="font-display tracking-[0.4em] text-[color:var(--color-turkish-blue-300)]">
          TENGRA
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {headerLinks.map((link) => {
            const isHome = link.href === "/";
            const href = isHome ? localizeHome(locale) : link.href;
            const isActive = pathname === href || (isHome && pathname === "/");

            return (
              <Link
                key={link.href}
                href={href}
                className={`transition hover:text-[color:var(--color-turkish-blue-200)] ${
                  isActive ? "text-[color:var(--color-turkish-blue-300)]" : "text-gray-300"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin"
              className={`transition hover:text-[color:var(--color-turkish-blue-200)] ${
                pathname?.startsWith("/admin") ? "text-[color:var(--color-turkish-blue-300)]" : "text-gray-300"
              }`}
            >
              {t("admin")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <span className="hidden text-xs text-gray-300 sm:block">
                {t("greeting", { name: user.name })}
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-xs text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.1)]"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-xs text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.1)]"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
