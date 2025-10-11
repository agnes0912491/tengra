"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "react-toastify";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{}|,.<>?]{6,}$/;
const sqlInjectionPattern = /(--|;|\/\*|\*\/|['"]|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|WHERE)\b)/i;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@tengra.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sanitizedEmail = useMemo(() => email.trim(), [email]);
  const sanitizedPassword = useMemo(() => password.trim(), [password]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!emailRegex.test(sanitizedEmail)) {
      const message = "Geçerli bir e-posta adresi giriniz.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!passwordRegex.test(sanitizedPassword)) {
      const message = "Şifre en az 6 karakter olmalı ve harf ile rakam içermelidir.";
      setError(message);
      toast.error(message);
      return;
    }

    if (
      sqlInjectionPattern.test(sanitizedEmail) ||
      sqlInjectionPattern.test(sanitizedPassword)
    ) {
      const message = "Şüpheli giriş tespit edildi. Lütfen geçerli bilgiler kullanın.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    const result = await login(sanitizedEmail, sanitizedPassword);

    if (!result.success) {
      const message = result.message ?? "Giriş yapılamadı";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success("Başarıyla giriş yapıldı. Yönetim paneline yönlendiriliyorsunuz.");
    setLoading(false);
    router.replace("/admin");
  };

  return (
    <section className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-20">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[rgba(0,167,197,0.2)] bg-[rgba(6,20,26,0.7)] p-8 shadow-[0_0_40px_rgba(0,167,197,0.1)]">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-display tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">
            Giriş Yap
          </h1>
          <p className="text-xs text-gray-400">
            Admin paneline erişmek için kayıtlı kullanıcı bilgilerinizi kullanın.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-gray-400" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-[rgba(0,167,197,0.25)] bg-[rgba(0,0,0,0.25)] px-4 py-2 text-sm text-white outline-none transition focus:border-[color:var(--color-turkish-blue-300)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-gray-400" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[rgba(0,167,197,0.25)] bg-[rgba(0,0,0,0.25)] px-4 py-2 text-sm text-white outline-none transition focus:border-[color:var(--color-turkish-blue-300)]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[color:var(--color-turkish-blue-400)] px-4 py-2 text-sm font-medium text-black transition hover:bg-[color:var(--color-turkish-blue-300)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="rounded-lg border border-[rgba(0,167,197,0.15)] bg-[rgba(0,167,197,0.05)] p-4 text-[11px] text-gray-300">
          <p className="font-semibold text-[color:var(--color-turkish-blue-200)]">Örnek Kullanıcılar</p>
          <ul className="mt-2 space-y-1">
            <li>
              <span className="font-medium text-white">Admin:</span> admin@tengra.com / admin123
            </li>
            <li>
              <span className="font-medium text-white">Üye:</span> uye@tengra.com / uye123
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
