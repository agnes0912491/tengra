"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ChevronDown } from "lucide-react";

import Img from "../../../public/tengra_without_text.png";
import LocaleSwitcher from "@/components/layout/locale-switcher";
import { useAuth } from "@/components/providers/auth-provider";
import { routing, type Locale } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  const isAdmin = user?.role === "admin";

  const isAdminRoute = useMemo(
    () => pathname?.startsWith("/admin"),
    [pathname]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast.info(tFooter("logoutSuccess"));
    router.push(locale === routing.defaultLocale ? "/" : `/${locale}`);
  }, [locale, logout, router, tFooter]);

  const handleOpenDashboard = useCallback(() => {
    router.push("/admin/dashboard");
  }, [router]);

  if (isAdminRoute) {
    return (
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed bottom-0 left-0 z-50 w-full border-t border-[rgba(255,255,255,0.1)] bg-[rgba(6,20,26,0.78)] backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 text-center text-xs text-[rgba(255,255,255,0.55)]">
          {tFooter("copyright", { year: new Date().getFullYear() })} —{" "}
          {tFooter("admin")}
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
            <Image
              src={Img.src}
              alt="Tengra"
              width={42}
              height={42}
              className="opacity-80"
            />
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
              <span className="text-[rgba(255,255,255,0.6)]">
                {tFooter("checking")}
              </span>
            ) : isAuthenticated ? (
              isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 rounded-full border border-[rgba(0,167,197,0.4)] bg-transparent px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--color-turkish-blue-100)] hover:bg-[rgba(0,167,197,0.12)]"
                    >
                      {tFooter("adminMenu.label")}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px] border border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.92)] text-[color:var(--color-turkish-blue-100)]">
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
                      {tFooter("adminMenu.greeting", {
                        name: user?.name ?? tFooter("adminMenu.label"),
                      })}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[rgba(0,167,197,0.25)]" />
                    <DropdownMenuItem
                      className="cursor-pointer text-sm text-[rgba(255,255,255,0.85)] hover:bg-[rgba(0,167,197,0.15)] focus:bg-[rgba(0,167,197,0.15)]"
                      onSelect={(event) => {
                        event.preventDefault();
                        handleOpenDashboard();
                      }}
                    >
                      {tFooter("adminMenu.dashboard")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-sm text-[rgba(255,255,255,0.85)] hover:bg-[rgba(207,63,75,0.2)] focus:bg-[rgba(207,63,75,0.2)]"
                      onSelect={(event) => {
                        event.preventDefault();
                        handleLogout();
                      }}
                    >
                      {tFooter("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 rounded-full border border-[rgba(0,167,197,0.4)] bg-transparent px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--color-turkish-blue-100)] hover:bg-[rgba(0,167,197,0.12)]"
                    >
                      <span className="truncate max-w-[7rem] text-left">
                        {user?.name ?? "—"}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px] border border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.92)] text-[color:var(--color-turkish-blue-100)]">
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
                      {tFooter("adminMenu.greeting", {
                        name: user?.name ?? "—",
                      })}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[rgba(0,167,197,0.25)]" />
                    <DropdownMenuItem
                      className="cursor-pointer text-sm text-[rgba(255,255,255,0.85)] hover:bg-[rgba(207,63,75,0.2)] focus:bg-[rgba(207,63,75,0.2)]"
                      onSelect={(event) => {
                        event.preventDefault();
                        handleLogout();
                      }}
                    >
                      {tFooter("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <Link
                href="/admin/login"
                className="rounded-full border border-[rgba(0,167,197,0.4)] px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
              >
                {tFooter("login")}
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={Img.src}
                alt="Tengra"
                width={30}
                height={30}
                className="opacity-80"
              />
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

          <div className="flex items-center justify-center text-[10px] text-[rgba(255,255,255,0.6)]">
            {/* Hide auth actions on small screens by design (no login/logout CTAs on mobile) */}
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
