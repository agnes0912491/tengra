"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/admin";
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const success = await login(username, password);

      if (success) {
        router.replace(nextUrl);
        router.refresh();
      } else {
        setError("Kullanıcı adı veya şifre hatalı.");
      }
    } catch (err) {
      setError("Giriş başarısız oldu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
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
            <label className="text-sm text-gray-300" htmlFor="username">
              Kullanıcı Adı / E-posta
            </label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="username veya email@example.com"
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

          <Button type="submit" className="w-full" disabled={loading}>
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
