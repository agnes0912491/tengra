"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@tengra/language";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, ExternalLink, User, Settings, LogOut, Shield } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AnimatedButton from "@/components/ui/animated-button";
import LocaleSwitcher from "@/components/layout/locale-switcher";

/* ... existing links constant ... */
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://tengra.studio";
const FORUM_ORIGIN = process.env.NEXT_PUBLIC_FORUM_URL || "https://forum.tengra.studio";
const LOGIN_URL = `${SITE_ORIGIN}/login`;
const REGISTER_URL = `${SITE_ORIGIN}/register`;

const headerLinks = [
  { href: "/", labelKey: "home" },
  { href: "/#projects", labelKey: "projects" },
  { href: "/#features", labelKey: "features" }, // Updated from goals
  { href: "/#process", labelKey: "process" },     // New
  { href: "/team", labelKey: "team" },
  { href: "/blogs", labelKey: "blogs" },
  { href: "/contact", labelKey: "contact" },
  { href: FORUM_ORIGIN, labelKey: "forum", isExternal: true },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { t: tHeader } = useTranslation("Header");
  const { t: tNav } = useTranslation("Navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    // Check if we are on a subdomain
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes('forum.')) {
        setIsSubdomain(true);
      }
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper to get correct href based on subdomain
  const getHref = (href: string) => {
    if (!isSubdomain) return href;
    if (href.startsWith("http")) return href;
    if (href.startsWith("#")) return `${SITE_ORIGIN}/${href}`;
    if (href.startsWith("/")) return `${SITE_ORIGIN}${href}`;
    return href;
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
          ? "bg-[rgba(15,31,54,0.95)] border-b border-[rgba(255,255,255,0.05)] backdrop-blur-xl shadow-lg"
          : "bg-transparent border-b border-transparent"
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href={getHref("/")} className="group flex items-center gap-3 relative z-10 text-[var(--color-turkish-blue-400)] transition-colors hover:text-[var(--color-turkish-blue-300)]">
              <Image
                src="https://cdn.tengra.studio/s/tengra/tengra-logo.png"
                alt={tHeader("logoAlt")}
                width={40}
                height={40}
                className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(30,184,255,0.4)] transition-all group-hover:drop-shadow-[0_0_25px_rgba(30,184,255,0.6)]"
              />
              <span className="font-bold text-xl tracking-[0.1em] text-white font-sans">
                TENGRA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-full px-2 py-1.5 backdrop-blur-md">
              {headerLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href) && link.href !== "/";
                const href = getHref(link.href);
                return (
                  <Link
                    key={link.labelKey}
                    href={href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActive ? "text-white" : "text-[rgba(255,255,255,0.6)] hover:text-white"
                      }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-[rgba(255,255,255,0.1)] rounded-full" />
                    )}
                    <span className="relative z-10 flex items-center gap-1">
                      {tNav(link.labelKey)}
                      {link.isExternal && <ExternalLink className="w-3 h-3 opacity-50" />}
                    </span>
                  </Link>
                )
              })}
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3">
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                      <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-all">
                        {user.avatar ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                            <Image
                              src={user.avatar}
                              alt={user.displayName || tHeader("userAlt")}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {user.displayName?.[0] || user.username?.[0] || tHeader("userInitial")}
                          </div>
                        )}
                        <span className="text-sm text-white font-medium pl-1 pr-2">{user.displayName || user.username}</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[rgba(6,20,27,0.95)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl text-white">
                      <DropdownMenuLabel>{tHeader("account")}</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                      <DropdownMenuItem className="focus:bg-[rgba(255,255,255,0.1)] cursor-pointer">
                        <Link href={getHref("/settings")} className="flex w-full items-center"><User className="mr-2 h-4 w-4" /> {tHeader("profile")}</Link>
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem className="focus:bg-[rgba(255,255,255,0.1)] cursor-pointer text-[var(--color-turkish-blue-400)]">
                          <Link href={getHref("/admin")} className="flex w-full items-center"><Shield className="mr-2 h-4 w-4" /> {tHeader("admin")}</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                      <DropdownMenuItem onClick={() => logout()} className="focus:bg-red-500/20 text-red-400 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> {tHeader("logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link href={LOGIN_URL} className="text-sm font-medium text-[rgba(255,255,255,0.6)] hover:text-white transition-colors">
                      {tHeader("login")}
                    </Link>
                    <Link href={REGISTER_URL}>
                      <AnimatedButton size="sm" className="bg-white text-black hover:bg-gray-200">
                        {tHeader("register")}
                      </AnimatedButton>
                    </Link>
                  </>
                )}
              </div>

              {/* Locale Switcher */}
              <div className="hidden lg:block ml-2 border-l border-[rgba(255,255,255,0.1)] pl-2">
                <LocaleSwitcher />
              </div>

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </header >

      {/* Mobile Menu Overlay... (Simplify for brevity in this update, core logic same as before but styled) */}
      {
        mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-[rgba(6,20,27,0.98)] backdrop-blur-xl pt-24 px-6 lg:hidden">
            <nav className="flex flex-col gap-4">
              {headerLinks.map(link => (
                <Link
                  key={link.labelKey}
                  href={getHref(link.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-medium text-white py-2 border-b border-[rgba(255,255,255,0.05)]"
                >
                  {tNav(link.labelKey)}
                </Link>
              ))}
              <div className="mt-8 flex flex-col gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link href={LOGIN_URL} onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-xl border border-[rgba(255,255,255,0.1)] text-center text-white">{tHeader("login")}</Link>
                    <Link href={REGISTER_URL} onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-xl bg-white text-black text-center font-bold">{tHeader("register")}</Link>
                  </>
                ) : (
                  <button onClick={logout} className="w-full py-3 rounded-xl border border-red-500/30 text-red-400">{tHeader("logout")}</button>
                )}
              </div>
            </nav>
          </div>
        )
      }
    </>
  );
}
