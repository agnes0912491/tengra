"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

type HeaderLink = {
  href: string;
  labelKey: string;
  isHomeAnchor?: boolean;
};

const headerLinks: HeaderLink[] = [
  { href: "/#goals", labelKey: "goals", isHomeAnchor: true },
  { href: "/#projects", labelKey: "projects", isHomeAnchor: true },
  { href: "/#network", labelKey: "network", isHomeAnchor: true },
  { href: "/team", labelKey: "team" },
  { href: "/blogs", labelKey: "blogs" },
  { href: "/contact", labelKey: "contact" },
  { href: "/forum", labelKey: "forum" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const tHeader = useTranslations("Header");
  const tNav = useTranslations("Navigation");

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-[rgba(0,167,197,0.16)] bg-[rgba(3,12,18,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-[13px]">
        <Link
          href="/"
          className="font-display text-sm tracking-[0.28em] text-[color:var(--color-turkish-blue-300)] soft-glow"
        >
          TENGRA
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {headerLinks.map((link) => {
            const href = link.href;
            const isHomeAnchor = link.isHomeAnchor;
            const isActive =
              (!isHomeAnchor && pathname?.startsWith(href)) ||
              (isHomeAnchor && pathname === "/" && href.startsWith("/#"));

            return (
              <Link
                key={link.href}
                href={href}
                className={`group relative transition hover:text-[color:var(--color-turkish-blue-200)] ${isActive ? "text-[color:var(--color-turkish-blue-300)]" : "text-gray-300"
                  }`}
              >
                {tNav(link.labelKey)}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[rgba(0,167,197,0.0)] via-[rgba(0,167,197,0.6)] to-[rgba(0,167,197,0.0)] transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin"
              prefetch={false}
              className={`transition hover:text-[color:var(--color-turkish-blue-200)] ${pathname?.startsWith("/admin") ? "text-[color:var(--color-turkish-blue-300)]" : "text-gray-300"
                }`}
            >
              {tHeader("admin")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <span className="hidden text-xs text-gray-300 sm:block">
                {tHeader("greeting", { name: user.displayName ?? user.username ?? "-" })}
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-xs text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.1)]"
              >
                {tHeader("logout")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-xs text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.1)]"
            >
              {tHeader("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
