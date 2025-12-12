"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, ExternalLink } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";

type HeaderLink = {
  href: string;
  labelKey: string;
  isExternal?: boolean;
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Shield } from "lucide-react";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://tengra.studio";
const FORUM_ORIGIN = process.env.NEXT_PUBLIC_FORUM_URL || "https://forum.tengra.studio";
const LOGIN_URL = `${SITE_ORIGIN}/login`;
const REGISTER_URL = `${SITE_ORIGIN}/register`;

// Fixed links to use absolute URLs for cross-subdomain navigation
const headerLinks: HeaderLink[] = [
  { href: SITE_ORIGIN, labelKey: "home" },
  { href: `${SITE_ORIGIN}/#goals`, labelKey: "goals" },
  { href: `${SITE_ORIGIN}/#projects`, labelKey: "projects" },
  { href: `${SITE_ORIGIN}/#network`, labelKey: "network" },
  { href: `${SITE_ORIGIN}/team`, labelKey: "team" },
  { href: `${SITE_ORIGIN}/blogs`, labelKey: "blogs" },
  { href: `${SITE_ORIGIN}/contact`, labelKey: "contact" },
  { href: FORUM_ORIGIN, labelKey: "forum", isExternal: true },
  { href: `${SITE_ORIGIN}/docs`, labelKey: "docs" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const tHeader = useTranslations("Header");
  const tNav = useTranslations("Navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle scroll effect and mount status
  useEffect(() => {
    // Wrap in setTimeout to avoid 'synchronous state update in effect' lint error
    const timer = setTimeout(() => setIsMounted(true), 0);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const currentOrigin = isMounted && typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
          ? "bg-[var(--glass-bg)] border-b border-[var(--glass-border)] backdrop-blur-xl shadow-lg"
          : "bg-transparent border-b border-transparent"
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link
              href="https://tengra.studio"
              className="group flex items-center gap-3 relative z-10"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[var(--color-turkish-blue-400)] opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500" />
                <span className="relative font-display text-2xl tracking-[0.2em] font-bold bg-gradient-to-r from-[var(--color-turkish-blue-200)] via-[var(--color-turkish-blue-400)] to-[var(--color-turkish-blue-200)] bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
                  TENGRA
                </span>
              </div>
            </Link>

            {/* Desktop Center Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-[var(--glass-bg-light)] border border-[var(--glass-border)] rounded-full px-2 py-1.5 backdrop-blur-md shadow-[var(--shadow-card)]">
              {headerLinks.map((link) => {
                // Logic to determine active state correctly across subdomains using client-side check
                let isActive = false;
                if (currentOrigin) {
                  try {
                    const linkUrl = new URL(link.href);
                    const linkOrigin = linkUrl.origin;
                    const linkPath = linkUrl.pathname;
                    const isAnchor = linkUrl.hash.length > 0;

                    if (currentOrigin === linkOrigin && !isAnchor) {
                      // Same domain, check path
                      if (linkPath === "/") {
                        isActive = pathname === "/";
                      } else {
                        isActive = pathname?.startsWith(linkPath) ?? false;
                      }
                    }
                  } catch {
                    // Fallback or ignore invalid URLs
                  }
                }

                return (
                  <Link
                    key={link.labelKey}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 group
                      ${isActive
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                  >
                    <span className="relative z-10 flex items-center gap-1">
                      {tNav(link.labelKey)}
                      {link.isExternal && <ExternalLink className="w-3 h-3 opacity-50" />}
                    </span>
                    {isActive && (
                      <span className="absolute inset-0 bg-[rgba(30,184,255,0.1)] border border-[rgba(72,213,255,0.2)] rounded-full" />
                    )}
                    {!isActive && (
                      <span className="absolute inset-0 bg-[rgba(255,255,255,0.03)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side - Auth Buttons */}
            <div className="flex items-center gap-4">
              {/* Desktop Auth */}
              <div className="hidden lg:flex items-center gap-3">
                {isAuthenticated && user ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="outline-none">
                        <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-[rgba(30,184,255,0.05)] border border-[rgba(72,213,255,0.1)] hover:bg-[rgba(30,184,255,0.1)] hover:border-[rgba(72,213,255,0.3)] transition-all cursor-pointer">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.displayName || user.username}
                              width={36}
                              height={36}
                              unoptimized
                              className="w-9 h-9 rounded-full object-cover shadow-lg"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                              {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col items-start mr-2">
                            <span className="text-xs text-[var(--color-turkish-blue-400)] font-medium">Hesabım</span>
                            <span className="text-xs text-[var(--text-secondary)] font-medium leading-none max-w-[100px] truncate">
                              {user.displayName || user.username}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--color-turkish-blue-300)] rotate-90" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl text-white">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{user.displayName || user.username}</p>
                            <p className="text-xs leading-none text-[var(--text-muted)] truncate">{user.email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[var(--glass-border)]" />
                        <DropdownMenuItem className="cursor-pointer hover:bg-[rgba(255,255,255,0.05)] focus:bg-[rgba(255,255,255,0.05)]">
                          <Link href="/settings" className="flex items-center w-full">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-[rgba(255,255,255,0.05)] focus:bg-[rgba(255,255,255,0.05)]">
                          <Link href="/settings" className="flex items-center w-full">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Ayarlar</span>
                          </Link>
                        </DropdownMenuItem>
                        {user.role === "admin" && (
                          <DropdownMenuItem className="cursor-pointer hover:bg-[rgba(30,184,255,0.1)] focus:bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-400)]">
                            <Link href="/admin" className="flex items-center w-full">
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Admin Panel</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-[var(--glass-border)]" />
                        <DropdownMenuItem
                          className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
                          onClick={() => logout()}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>{tHeader("logout")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Link
                      href={LOGIN_URL}
                      className="px-5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                      {tHeader("login")}
                    </Link>
                    <Link
                      href={REGISTER_URL}
                      className="group relative px-6 py-2.5 text-sm font-bold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-glow-md)]"
                    >
                      <div className="absolute inset-0 bg-[var(--gradient-turkish-blue)] opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative z-10 flex items-center gap-2">
                        {tHeader("register")}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(30,184,255,0.1)] transition-all z-50"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden bg-[var(--color-surface-900)]/95 backdrop-blur-2xl transition-all duration-500 ease-in-out ${mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
          }`}
      >
        <div className="flex flex-col h-full pt-28 pb-10 px-6">
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {headerLinks.map((link, idx) => (
              <Link
                key={link.labelKey}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between p-4 text-lg font-medium rounded-2xl hover:bg-[rgba(30,184,255,0.05)] border border-transparent hover:border-[rgba(72,213,255,0.1)] transition-all duration-300"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-secondary)] group-hover:text-white transition-colors">
                    {tNav(link.labelKey)}
                  </span>
                  {link.isExternal && <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />}
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-turkish-blue-400)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            ))}

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between p-4 text-lg font-medium rounded-2xl hover:bg-[rgba(30,184,255,0.05)] border border-transparent hover:border-[rgba(72,213,255,0.1)] transition-all duration-300"
              >
                <span className="text-[var(--text-secondary)] group-hover:text-white transition-colors">
                  {tHeader("admin")}
                </span>
              </Link>
            )}
          </nav>

          <div className="pt-8 mt-4 border-t border-[rgba(255,255,255,0.1)]">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <Link
                  href={LOGIN_URL}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-4 rounded-xl border border-[rgba(72,213,255,0.2)] text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.05)] font-medium text-lg"
                >
                  {tHeader("login")}
                </Link>
                <Link
                  href={REGISTER_URL}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-4 rounded-xl bg-[var(--gradient-turkish-blue)] text-white font-bold text-lg shadow-[var(--shadow-glow-md)]"
                >
                  {tHeader("register")}
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-full py-4 rounded-xl border border-[rgba(72,213,255,0.2)] text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.05)] font-medium text-lg"
              >
                {tHeader("logout")}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
