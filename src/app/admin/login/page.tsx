"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    // Sanitize inputs on client-side
    const { sanitizeInput } = await import("@/lib/sanitize");
    const sEmail = sanitizeInput(email, 191);
    const sPassword = sanitizeInput(password, 128);

    // Call backend auth endpoint directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username: sEmail, password: sPassword }),
    }).catch(() => null);

    if (!response || !response.ok) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }

    const payload = await response.json().catch(() => null);
    const token = payload?.token;
    if (!token) {
      setError("Giriş başarısız oldu.");
      setLoading(false);
      return;
    }

    // Verify role by calling backend /users/me or validate endpoint if exists
    const meRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }).catch(() => null);

    if (!meRes || !meRes.ok) {
      setError("Giriş doğrulanamadı.");
      setLoading(false);
      return;
    }

    const mePayload = await meRes.json().catch(() => null);
    // backend GET /users returns a list or user object; try to find role
    const user = mePayload?.user ?? (Array.isArray(mePayload?.users) ? mePayload.users[0] : null);
    if (!user) {
      setError("Kullanıcı bilgisi alınamadı.");
      setLoading(false);
      return;
    }

    if (user.role !== "Admin") {
      setError("Yönetici yetkiniz yok.");
      setLoading(false);
      return;
    }

    // set cookie via document.cookie (frontend) — server-side cookie would be safer
    document.cookie = `admin_session=${token}; path=/; max-age=${60 * 60 * 24}; samesite=lax`;

    router.replace(nextUrl);
    router.refresh();
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.04)] border border-[rgba(0,167,197,0.2)] rounded-2xl shadow-xl backdrop-blur-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-display tracking-[0.25em] text-[color:var(--color-turkish-blue-400)]">
            ADMIN LOGIN
          </h1>
          <p className="text-sm text-gray-400">
            Lütfen yönetici kimlik bilgilerinizi kullanarak giriş yapın.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-sm text-gray-300" htmlFor="email">
              E-posta
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm text-gray-300" htmlFor="password">
              Şifre
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-400 text-center" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş yap"}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500">
          Yönetici erişimi için geçerli kimlik bilgilerini kullanın.
        </p>
      </div>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

