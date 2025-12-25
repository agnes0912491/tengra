"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@tengra/language";
import { createContactSubmission } from "@/lib/db";
import {
  Send,
  User,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  MapPin,
  Clock,
  Globe,
  MessageCircle,
  Headphones,
} from "lucide-react";
import { FaDiscord, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import Link from "next/link";

export default function ContactForm() {
  const { t } = useTranslation("Contact");
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Quick Contact Card */}
          <div className="relative rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] backdrop-blur-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[rgba(30,184,255,0.05)] to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-5">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
                {t("sidebar.quickContact")}
              </h3>

              <div className="space-y-4">
                <a
                  href="mailto:info@tengra.studio"
                  className="text-lg text-[color:var(--color-turkish-blue-400)] dark:text-[color:var(--color-turkish-blue-300)] font-medium hover:underline transition-all"
                >
                  info@tengra.studio
                </a>

                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="p-2 rounded-lg bg-[rgba(30,184,255,0.1)]">
                    <MapPin className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                  </div>
                  {t("sidebar.location")}
                </div>

                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="p-2 rounded-lg bg-[rgba(30,184,255,0.1)]">
                    <Globe className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                  </div>
                  tengra.studio
                </div>
              </div>
            </div>
          </div>

          {/* Response Time Card */}
          <div className="relative rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] backdrop-blur-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[rgba(30,184,255,0.05)] to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
                {t("sidebar.responseTime")}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-[rgba(30,184,255,0.2)] overflow-hidden">
                    <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-400)]" />
                  </div>
                </div>
                <span className="text-sm font-medium text-[var(--color-turkish-blue-400)]">{t("sidebar.responseDesc")}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {t("sidebar.responseNote")}
              </p>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="relative rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] backdrop-blur-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[rgba(30,184,255,0.05)] to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
                {t("sidebar.social")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://discord.gg/tengra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(88,101,242,0.1)] border border-[rgba(88,101,242,0.2)] hover:bg-[rgba(88,101,242,0.2)] transition-all group"
                >
                  <FaDiscord className="w-5 h-5 text-[#5865F2]" />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">{t("social.discord")}</span>
                </a>
                <a
                  href="https://github.com/TengraStudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-all group"
                >
                  <FaGithub className="w-5 h-5 text-white" />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">{t("social.github")}</span>
                </a>
                <a
                  href="https://x.com/tengra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(29,161,242,0.1)] border border-[rgba(29,161,242,0.2)] hover:bg-[rgba(29,161,242,0.2)] transition-all group"
                >
                  <FaTwitter className="w-5 h-5 text-[#1DA1F2]" />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">{t("social.x")}</span>
                </a>
                <a
                  href="https://linkedin.com/company/tengra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(0,119,181,0.1)] border border-[rgba(0,119,181,0.2)] hover:bg-[rgba(0,119,181,0.2)] transition-all group"
                >
                  <FaLinkedin className="w-5 h-5 text-[#0077B5]" />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">{t("social.linkedin")}</span>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Teaser */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[rgba(30,184,255,0.15)] to-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.2)] backdrop-blur-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div className="relative z-10 space-y-3">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {t("sidebar.faqTitle")}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {t("sidebar.faqDesc")}
              </p>
              <Link
                href="/#faq"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-turkish-blue-400)] hover:text-[var(--color-turkish-blue-300)] transition-colors"
              >
                {t("sidebar.faqLink")}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2 relative rounded-3xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] backdrop-blur-xl p-8 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[rgba(30,184,255,0.05)] to-transparent pointer-events-none" />

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-[rgba(72,213,255,0.2)] rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-[rgba(72,213,255,0.2)] rounded-br-3xl" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="section-title"
              >
                {t("title")}
              </motion.h1>
              <div className="divider mt-6 mb-4" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-[var(--text-secondary)] max-w-xl mx-auto"
              >
                {t("description")}
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    <User className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                    {t("name")}
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                    placeholder={t("placeholders.name")}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    <Mail className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                    {t("email")}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                    placeholder={t("placeholders.email")}
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  <FileText className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                  {t("subject")}
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.currentTarget.value)}
                  required
                  placeholder={t("placeholders.subject")}
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  <Phone className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                  {t("phone")} <span className="text-[var(--text-muted)]/60">({t("optional")})</span>
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.currentTarget.value)}
                  placeholder={t("placeholders.phone")}
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                  {t("message")}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  required
                  rows={6}
                  placeholder={t("placeholders.message")}
                  className="w-full px-4 py-3 rounded-xl text-base md:text-sm bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] backdrop-blur-sm transition-all duration-200 focus:border-[var(--color-turkish-blue-500)] focus:ring-2 focus:ring-[rgba(30,184,255,0.2)] focus:outline-none resize-none"
                />
              </div>

              {/* Submit Button & Status */}
              <div className="flex flex-col gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={status === "submitting"}
                  size="lg"
                  className="w-full md:w-auto md:px-12"
                >
                  {status === "submitting" ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t("submit")}
                      <Send className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>

                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-emerald-400"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {t("success")}
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-red-400"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {t("error")}
                  </motion.div>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
