"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { resolveCdnUrl } from "@/lib/constants";
import { createContactSubscription } from "@/lib/db";
import { AgentBadge } from "./footer/agent-badge";
import { Send, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const tFooter = useTranslations("Footer");
  const tSub = useTranslations("FooterSubscribe");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [submitting, setSubmitting] = React.useState(false);

  const footerLinks = [
    {
      title: "Company",
      links: [
        { label: "About", href: "/#goals" },
        { label: "Team", href: "/team" },
        { label: "Blog", href: "/blogs" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Projects", href: "/#projects" },
        { label: "Forum", href: "https://forum.tengra.studio" },
        { label: "FAQ", href: "/#faq" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://x.com/tengra", label: "Twitter" },
    { icon: Github, href: "https://github.com/TengraStudio", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/tengra", label: "LinkedIn" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative border-t border-[rgba(72,213,255,0.1)] bg-[rgba(2,6,23,0.9)] backdrop-blur-xl"
    >
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                crossOrigin="anonymous"
                src={resolveCdnUrl("/uploads/tengra_without_text.png")}
                alt="Tengra"
                width={40}
                height={40}
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <span className="font-display text-xl tracking-[0.25em] font-bold bg-gradient-to-r from-[var(--color-turkish-blue-300)] to-[var(--color-turkish-blue-500)] bg-clip-text text-transparent">
                TENGRA
              </span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-muted)] max-w-xs">
              Building artefact-like games, AI-driven worlds, and experimental systems.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[rgba(30,184,255,0.08)] border border-[rgba(72,213,255,0.15)] text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] hover:border-[rgba(72,213,255,0.3)] hover:bg-[rgba(30,184,255,0.12)] transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Agent Badge */}
            <div className="mt-6">
              <AgentBadge />
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-400)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              {tSub("title")}
            </h4>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setStatus("idle");
                setSubmitting(true);
                try {
                  const created = await createContactSubscription(email.trim());
                  if (created) {
                    setStatus("success");
                    setEmail("");
                  } else {
                    setStatus("error");
                  }
                } catch (err) {
                  console.error("Failed to save subscription", err);
                  setStatus("error");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder={tSub("placeholder")}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-turkish-blue-500)] focus:ring-2 focus:ring-[rgba(30,184,255,0.2)] focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] text-white shadow-[0_4px_20px_rgba(30,184,255,0.25)] hover:shadow-[0_6px_25px_rgba(30,184,255,0.35)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {tSub("button")}
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
              {status === "success" && (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {tSub("success")}
                </p>
              )}
              {status === "error" && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {tSub("error")}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[rgba(72,213,255,0.08)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            {tFooter("copyright", { year: 2025 })}
          </p>
          <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--color-turkish-blue-400)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-turkish-blue-400)] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
