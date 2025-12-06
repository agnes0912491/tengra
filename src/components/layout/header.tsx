"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";

type HeaderLink = {
  href: string;
  labelKey: string;
  isHomeAnchor?: boolean;
};

const headerLinks: HeaderLink[] = [
  { href: "/", labelKey: "home" },
  { href: "/#goals", labelKey: "goals", isHomeAnchor: true },
  { href: "/#projects", labelKey: "projects", isHomeAnchor: true },
  { href: "/#network", labelKey: "network", isHomeAnchor: true },
  { href: "/team", labelKey: "team" },
  { href: "/blogs", labelKey: "blogs" },
  { href: "/contact", labelKey: "contact" },
  { href: "/forum", labelKey: "forum" },
  { href: "/docs", labelKey: "docs" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const tHeader = useTranslations("Header");
  const tNav = useTranslations("Navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glass Background */}
      <div className="absolute inset-0 bg-[rgba(2,6,23,0.8)] backdrop-blur-xl border-b border-[rgba(72,213,255,0.1)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-[var(--color-turkish-blue-600)] opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />
              <span className="relative font-display text-xl tracking-[0.3em] font-bold bg-gradient-to-r from-[var(--color-turkish-blue-300)] to-[var(--color-turkish-blue-500)] bg-clip-text text-transparent">
                TENGRA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {headerLinks.map((link) => {
              const href = link.href;
              const isHomeAnchor = link.isHomeAnchor;
              // Home link is active only on exact "/" path
              // Anchor links (/#goals, etc.) are never "active" since we can't detect scroll position
              // Regular links are active when pathname starts with their href
              const isActive =
                (href === "/" && pathname === "/") ||
                (!isHomeAnchor && href !== "/" && pathname?.startsWith(href));

              return (
                <Link
                  key={link.href}
                  href={href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? "text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.1)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                    }`}
                >
                  {tNav(link.labelKey)}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-[var(--color-turkish-blue-400)] to-[var(--color-turkish-blue-600)]" />
                  )}
                </Link>
              );
            })}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                prefetch={false}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${pathname?.startsWith("/admin")
                    ? "text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.1)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                  }`}
              >
                {tHeader("admin")}
              </Link>
            )}
          </nav>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="hidden lg:block text-sm text-[var(--text-muted)]">
                  {tHeader("greeting", { name: user.displayName ?? user.username ?? "-" })}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-[rgba(72,213,255,0.2)] text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.05)] hover:bg-[rgba(30,184,255,0.1)] hover:border-[rgba(72,213,255,0.3)] transition-all duration-200"
                >
                  {tHeader("logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-[rgba(72,213,255,0.2)] text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.05)] hover:bg-[rgba(30,184,255,0.1)] hover:border-[rgba(72,213,255,0.3)] transition-all duration-200"
                >
                  {tHeader("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] text-white shadow-[0_4px_20px_rgba(30,184,255,0.3)] hover:shadow-[0_6px_30px_rgba(30,184,255,0.4)] hover:scale-[1.02] transition-all duration-200"
                >
                  {tHeader("register")}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.1)] transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[rgba(2,6,23,0.95)] backdrop-blur-xl border-b border-[rgba(72,213,255,0.1)]">
          <nav className="px-4 py-4 space-y-1">
            {headerLinks.map((link) => {
              const isActive =
                (link.href === "/" && pathname === "/") ||
                (!link.isHomeAnchor && link.href !== "/" && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all
                    ${isActive
                      ? "text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.1)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)]"
                    }`}
                >
                  {tNav(link.labelKey)}
                </Link>
              );
            })}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all"
              >
                {tHeader("admin")}
              </Link>
            )}

            {/* Mobile Auth Links */}
            {!isAuthenticated && (
              <div className="pt-4 mt-4 border-t border-[rgba(72,213,255,0.1)] space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:text-[var(--color-turkish-blue-300)] hover:bg-[rgba(30,184,255,0.05)] transition-all"
                >
                  {tHeader("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] text-white text-center transition-all"
                >
                  {tHeader("register")}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
