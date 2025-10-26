"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  const { login, verifyAdminOtp, user, isAuthenticated } = useAuth();
  const t = useTranslations("AdminLogin");

  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpTemporaryToken, setOtpTemporaryToken] = useState<string | null>(null);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const otpExpired = useMemo(
    () => step === "otp" && remainingSeconds <= 0,
    [step, remainingSeconds]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setCredentials((prev) => ({
      ...prev,
      [id as "username" | "password"]: value,
    }));
  };

  const handleOtpChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtpCode(value);
    }
  };

  const resetOtpState = useCallback(() => {
    setOtpCode("");
    setOtpToken(null);
    setOtpTemporaryToken(null);
    setPendingUsername(null);
    setOtpExpiresAt(null);
    setRemainingSeconds(0);
    setStep("credentials");
  }, []);

  useEffect(() => {
    if (step !== "otp" || !otpExpiresAt) {
      return;
    }

    const calculateRemaining = () => {
      const diff = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };

    calculateRemaining();

    const interval = window.setInterval(calculateRemaining, 1000);

    return () => window.clearInterval(interval);
  }, [step, otpExpiresAt]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router, user]);

  const handleCredentialsSubmit = useCallback(async () => {
    const username = credentials.username.trim();
    const password = credentials.password;

    if (!username || !password) {
      toast.error(t("toast.missingCredentials"));
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password, "admin");

      if (result.success) {
        toast.success(t("toast.success"));
        router.replace(safeNextUrl);
        router.refresh();
        return;
      }

      if (result.reason === "otpRequired") {
        setPendingUsername(username);
        setOtpToken(result.challenge.otpToken);
        setOtpTemporaryToken(result.challenge.temporaryToken ?? null);
        const expiresAtTimestamp = result.challenge.expiresAt
          ? new Date(result.challenge.expiresAt).getTime()
          : Date.now() + (result.challenge.expiresInSeconds ?? 300) * 1000;
        setOtpExpiresAt(expiresAtTimestamp);
        setRemainingSeconds(
          Math.max(0, Math.floor((expiresAtTimestamp - Date.now()) / 1000))
        );
        setStep("otp");
        setOtpCode("");
        toast.info(t("toast.otpSent"));
        return;
      }

      const failureMessage =
        result.reason === "invalidCredentials"
          ? t("toast.invalidCredentials")
          : t("toast.genericError");

      toast.error(failureMessage);
    } catch (error) {
      console.error("Admin login failed:", error);
      toast.error(t("toast.genericError"));
    } finally {
      setLoading(false);
    }
  }, [
    credentials.password,
    credentials.username,
    login,
    router,
    safeNextUrl,
    t,
  ]);

  const handleOtpSubmit = useCallback(async () => {
    if (!pendingUsername || !otpToken) {
      toast.error(t("toast.genericError"));
      resetOtpState();
      return;
    }

    if (otpCode.length !== 6) {
      toast.error(t("toast.otpInvalid"));
      return;
    }

    if (otpExpired) {
      toast.error(t("toast.otpExpired"));
      resetOtpState();
      return;
    }

    setOtpLoading(true);

    try {
      const result = await verifyAdminOtp(
        pendingUsername,
        otpCode,
        otpToken,
        otpTemporaryToken ?? undefined
      );

      if (result.success) {
        toast.success(t("toast.success"));
        router.replace(safeNextUrl);
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
      setOtpLoading(false);
    }
  }, [
    otpCode,
    otpExpired,
    otpToken,
    otpTemporaryToken,
    pendingUsername,
    resetOtpState,
    router,
    safeNextUrl,
    t,
    verifyAdminOtp,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === "credentials") {
      await handleCredentialsSubmit();
    } else {
      await handleOtpSubmit();
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md bg-[rgba(255,255,255,0.04)] border border-[rgba(0,167,197,0.2)] rounded-2xl shadow-xl backdrop-blur-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-display tracking-[0.25em] text-[color:var(--color-turkish-blue-400)]">
            {step === "credentials" ? t("title") : t("otp.title")}
          </h1>
          <p className="text-sm text-gray-400">
            {step === "credentials" ? t("description") : t("otp.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "credentials" ? (
            <>
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
            </>
          ) : (
            <>
              <div className="space-y-2 text-left">
                <label className="text-sm text-gray-300" htmlFor="otp-code">
                  {t("otp.codeLabel")}
                </label>
                <Input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={otpCode}
                  onChange={handleOtpChange}
                  placeholder={t("otp.codePlaceholder")}
                  className="text-center tracking-[0.5em] text-lg"
                />
              </div>

              <div className="text-xs text-gray-400 text-center">
                {otpExpired
                  ? t("otp.expired")
                  : t("otp.expiresIn", {
                      minutes: Math.floor(remainingSeconds / 60)
                        .toString()
                        .padStart(2, "0"),
                      seconds: (remainingSeconds % 60).toString().padStart(2, "0"),
                    })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="submit" className="w-full" disabled={otpLoading || otpExpired}>
                  {otpLoading ? t("otp.button.loading") : t("otp.button.submit")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={resetOtpState}
                >
                  {t("otp.back")}
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="text-xs text-center text-gray-500">
          {t("footer")}
        </p>
      </div>
    </section>
  );
}
