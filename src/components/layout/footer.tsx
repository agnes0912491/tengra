"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Img from "../../../public/tengra_without_text.png";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "react-toastify";

const links = [
  { href: "/#goals", label: "Goals" },
  { href: "/#projects", label: "Projects" },
  { href: "/#network", label: "Network" },
  { href: "/#team", label: "Team" },
  { href: "/blogs", label: "Blog" },
  { href: "/forum", label: "Forum" },
];

export default function Footer() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = useMemo(() => pathname?.startsWith("/admin"), [pathname]);

  const handleLogout = useCallback(() => {
    logout();
    toast.info("Oturum kapatıldı.");
    router.push("/");
  }, [logout, router]);

  if (isAdminRoute) {
    return (
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed bottom-0 left-0 z-50 w-full border-t border-[rgba(255,255,255,0.1)] bg-[rgba(6,20,26,0.78)] backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 text-center text-xs text-[rgba(255,255,255,0.55)]">
          © {new Date().getFullYear()} Tengra Studio — Yönetim Paneli
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
              alt="Tengra Symbol"
              width={42}
              height={42}
              className="opacity-80"
            />
            <span className="font-display text-lg tracking-[0.4em] text-[color:var(--color-turkish-blue-400)] soft-glow">
              TENGRA
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[color:var(--color-turkish-blue-300)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-xs text-[rgba(255,255,255,0.6)]">
            <span className="hidden text-[rgba(255,255,255,0.45)] md:inline">
              © {new Date().getFullYear()} Tengra Studio
            </span>
            {loading ? (
              <span className="text-[rgba(255,255,255,0.6)]">Kontrol ediliyor...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-[color:var(--color-turkish-blue-200)]">
                  {user?.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[rgba(0,167,197,0.4)] px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : <></>}
          </div>
        </div>

        <div className="space-y-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={Img.src}
                alt="Tengra Symbol"
                width={30}
                height={30}
                className="opacity-80"
              />
              <span className="font-display text-sm tracking-[0.35em] text-[color:var(--color-turkish-blue-400)] soft-glow">
                TENGRA
              </span>
            </div>
            <span className="text-[10px] text-[rgba(255,255,255,0.45)]">
              © {new Date().getFullYear()}
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[color:var(--color-turkish-blue-300)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-between text-[10px] text-[rgba(255,255,255,0.6)]">
            {loading ? (
              <span>Kontrol ediliyor...</span>
            ) : isAuthenticated ? (
              <>
                <span className="text-[color:var(--color-turkish-blue-200)]">{user?.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[rgba(0,167,197,0.35)] px-2 py-1 uppercase tracking-widest text-[0.6rem] text-[color:var(--color-turkish-blue-100)]"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-[rgba(0,167,197,0.35)] px-3 py-1 uppercase tracking-widest text-[0.6rem] text-[color:var(--color-turkish-blue-100)]"
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
