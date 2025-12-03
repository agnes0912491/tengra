"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { createContactSubmission } from "@/lib/db";

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [geo, setGeo] = useState<{ ip?: string; city?: string; country?: string }>({});
  const [status, setStatus] = useState<"idle" | "success" | "error" | "submitting">("idle");

  // Best-effort IP info (public API); failures are ignored
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) return;
        const json = await res.json().catch(() => null);
        if (cancel || !json) return;
        setGeo({
          ip: typeof json.ip === "string" ? json.ip : undefined,
          city: typeof json.city === "string" ? json.city : undefined,
          country: typeof json.country === "string" ? json.country : undefined,
        });
      } catch {
        // ignore
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const created = await createContactSubmission({
        name,
        email,
        subject,
        message,
        phone: phone.trim() || undefined,
        ipAddress: geo.ip,
        city: geo.city,
        country: geo.country,
      });
      if (created) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setPhone("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Failed to save contact submission", err);
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.7)]/80 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-display tracking-[0.2em] text-[color:var(--color-turkish-blue-300)]">
          {t("title")}
        </h1>
        <p className="text-sm md:text-base text-[color:var(--text-muted)]">{t("description")}</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.7)]">
              {t("name")}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
              className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.7)]">
              {t("email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] text-white"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.7)]">
            {t("subject")}
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.currentTarget.value)}
            required
            className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] text-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.7)]">
            {t("phone")} ({t("optional")})
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
            className="border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] text-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.7)]">
            {t("message")}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            required
            rows={6}
            className="w-full rounded-lg border border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] p-3 text-white focus:border-[rgba(0,167,197,0.5)] focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={status === "submitting"} className="btn btn-primary btn-ripple text-[11px] tracking-[0.22em] uppercase">
            {status === "submitting" ? t("saving") ?? t("submit") : t("submit")}
          </Button>
          {status === "success" && (
            <p className="text-sm text-emerald-400">{t("success")}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-400">{t("error")}</p>
          )}
        </div>
      </form>
    </div>
  );
}
