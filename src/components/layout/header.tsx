"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/blogs", label: "Bloglar" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[rgba(3,12,18,0.6)] border-b border-[rgba(0,167,197,0.15)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm">
        <Link href="/" className="font-display tracking-[0.4em] text-[color:var(--color-turkish-blue-300)]">
          TENGRA
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition hover:text-[color:var(--color-turkish-blue-200)] ${
                pathname === link.href ? "text-[color:var(--color-turkish-blue-300)]" : "text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin"
              className={`transition hover:text-[color:var(--color-turkish-blue-200)] ${
                pathname?.startsWith("/admin")
                  ? "text-[color:var(--color-turkish-blue-300)]"
                  : "text-gray-300"
              }`}
            >
              Admin Paneli
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <span className="hidden text-xs text-gray-300 sm:block">
                Merhaba, <span className="text-[color:var(--color-turkish-blue-200)]">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-xs text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.1)]"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-xs text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.1)]"
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
