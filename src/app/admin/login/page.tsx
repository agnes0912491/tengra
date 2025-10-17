"use client";

import { FormEvent, useState, Suspense, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/admin";
  const { login } = useAuth();
  const t = useTranslations("AdminLogin");

  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setCredentials((prev) => ({
      ...prev,
      [id as "username" | "password"]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const username = credentials.username.trim();
      const password = credentials.password;

      if (!username || !password) {
        toast.error(t("toast.missingCredentials"));
        return;
      }

      setLoading(true);

      const result = await login(username, password);

      if (result.success) {
        toast.success(t("toast.success"));
        router.replace(nextUrl);
        router.refresh();
      } else {
        const failureMessage =
          result.reason === "invalidCredentials"
            ? t("toast.invalidCredentials")
            : t("toast.genericError");

        toast.error(failureMessage);
      }
    } catch (err) {
      console.error("Admin login failed:", err);
      toast.error(t("toast.genericError"));
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
              value={credentials.username}
              onChange={handleChange}
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
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

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
