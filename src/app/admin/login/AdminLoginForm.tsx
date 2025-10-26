"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrlParam = searchParams.get("next");
  const safeNextUrl =
    nextUrlParam && !nextUrlParam.startsWith("/admin/login")
      ? nextUrlParam
      : "/admin/dashboard";
  const { login, user, isAuthenticated } = useAuth();
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

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router, user]);

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

      const result = await login(username, password, "admin");

      if (result.success) {
        toast.success(t("toast.success"));
        router.replace(safeNextUrl);
        router.refresh();
        return;
      }

      // If the login flow requires two-factor authentication we expect the
      // global AuthProvider to show the TwoFactorModal (it sets a pending
      // temp token and renders the modal). Do not show a generic error toast
      // in that case; the modal will guide the user.
      if (result.reason === "requires2FA") {
        // Show a neutral/info toast so the user knows to check their email.
        // Use a stable hard-coded string to avoid throwing if a translation
        // key is missing in some locales.
        // Deulbug log the rest so we can confirm the payload in the browser console.
        // eslint-disable-next-line no-console
        console.log("login result (requires2FA):", result);
        toast.info("İki adımlı doğrulama gerekli — lütfen e-postanızı kontrol edin.");
        return;
      }

      const failureMessage =
        result.reason === "invalidCredentials"
          ? t("toast.invalidCredentials")
          : t("toast.genericError");

      toast.error(failureMessage);
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
            {t("title")}
          </h1>
          <p className="text-sm text-gray-400">
            {t("description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-sm text-gray-300" htmlFor="username">
              {t("usernameLabel")}
            </label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={credentials.username}
              onChange={handleChange}
              placeholder={t("usernamePlaceholder")}
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm text-gray-300" htmlFor="password">
              {t("passwordLabel")}
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
            {loading ? t("button.loading") : t("button.submit")}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500">
          {t("footer")}
        </p>
      </div>
    </section>
  );
}
