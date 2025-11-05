"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

type HeaderLink = {
  href: string;
  labelKey: string;
};

// Primary navigation links rendered in the site header.
const headerLinks: HeaderLink[] = [
  { href: "/", labelKey: "home" },
  { href: "/blogs", labelKey: "blogs" },
];

export default function Header() {
  const pathname = usePathname();
  // Read current auth state (client-side only)
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslations("Header");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[rgba(3,12,18,0.6)] border-b border-[rgba(0,167,197,0.15)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm">
        <Link href="/" className="font-display tracking-[0.4em] text-[color:var(--color-turkish-blue-300)]">
          TENGRA
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {headerLinks.map((link) => {
            const href = link.href;
            const isActive = pathname === href;

            return (
              <Link
                key={link.href}
                href={href}
                className={`group relative transition hover:text-[color:var(--color-turkish-blue-200)] ${isActive ? "text-[color:var(--color-turkish-blue-300)]" : "text-gray-300"
                  }`}
              >
                {t(link.labelKey)}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[rgba(0,167,197,0.0)] via-[rgba(0,167,197,0.6)] to-[rgba(0,167,197,0.0)] transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
          {/* Admin link appears only for authenticated admin users.
        Server-side authorization must still be enforced on /admin. */}
          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin"
              prefetch={false}
              className={`transition hover:text-[color:var(--color-turkish-blue-200)] ${pathname?.startsWith("/admin") ? "text-[color:var(--color-turkish-blue-300)]" : "text-gray-300"
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
                {t("greeting", { name: user.displayName ?? user.username ?? "-" })}
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
