"use client";

import * as React from "react";
import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ChevronDown } from "lucide-react";
import { resolveCdnUrl } from "@/lib/constants";
import LocaleSwitcher from "@/components/layout/locale-switcher";
import { useAuth } from "@/components/providers/auth-provider";
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

export default function Footer() {
  const tFooter = useTranslations("Footer");
  const tNavigation = useTranslations("Navigation");
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
    router.push("/");
  }, [logout, router, tFooter]);

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
              src={resolveCdnUrl("/uploads/tengra_without_text.png")}
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
            {navLinks.map((link) => {
              const isHomeAnchor = link.href.startsWith("/#");
              const isActive = (!isHomeAnchor && pathname?.startsWith(link.href)) || (isHomeAnchor && pathname === "/");
              const base = isActive
                ? "text-[color:var(--color-turkish-blue-300)] hover:text-[color:var(--color-turkish-blue-200)]"
                : "text-[rgba(255,255,255,0.55)] hover:text-[rgba(255,255,255,0.8)]";
              return (
                <Link key={link.href} href={link.href} className={"transition-colors " + base}>
                  {tNavigation(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          <AgentBadge />
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
                        name: user?.displayName ?? tFooter("adminMenu.label"),
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
                            {user?.displayName ?? "—"}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px] border border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.92)] text-[color:var(--color-turkish-blue-100)]">
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
                      {tFooter("adminMenu.greeting", {
                        name: user?.displayName ?? "—",
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
              <></>
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
            {navLinks.map((link) => {
              const isHomeAnchor = link.href.startsWith("/#");
              const isActive = (!isHomeAnchor && pathname?.startsWith(link.href)) || (isHomeAnchor && pathname === "/");
              const base = isActive
                ? "text-[color:var(--color-turkish-blue-300)] hover:text-[color:var(--color-turkish-blue-200)]"
                : "text-[rgba(255,255,255,0.55)] hover:text-[rgba(255,255,255,0.8)]";
              return (
                <Link key={link.href} href={link.href} className={"transition-colors " + base}>
                  {tNavigation(link.labelKey)}
                </Link>
              );
            })}
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

function AgentBadge() {
  const [online, setOnline] = React.useState(false);
  const [name, setName] = React.useState<string>("AI Agent");
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agent/status", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setOnline(Boolean(json?.online));
          if (typeof json?.name === "string") setName(json.name);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);
  if (!online) return null;
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="chip">
        <span className="mr-1.5 inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
        {name} Online
      </span>
    </div>
  );
}
