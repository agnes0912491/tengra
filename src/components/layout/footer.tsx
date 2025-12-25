"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Mail, Heart, ArrowRight } from "lucide-react";
import AnimatedButton from "@/components/ui/animated-button";
import GradientText from "@/components/ui/gradient-text";
import { useTranslation } from "@tengra/language";
import { useState, useEffect } from "react";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://tengra.studio";

const Footer = () => {
  const { t } = useTranslation("Footer");
  const currentYear = new Date().getFullYear();
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes('forum.')) {
        setIsSubdomain(true);
      }
    }
  }, []);

  const getHref = (href: string) => {
    if (!isSubdomain) return href;
    if (href.startsWith("http")) return href;
    if (href.startsWith("#")) return `${SITE_ORIGIN}/${href}`;
    if (href.startsWith("/")) return `${SITE_ORIGIN}${href}`;
    return href;
  };

  return (
    <footer className="relative bg-[rgba(3,12,18,0.95)] border-t border-[rgba(255,255,255,0.05)] pt-20 pb-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[rgba(0,167,197,0.15)] via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href={getHref("/")} className="inline-block mb-6">
              <span className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-[var(--color-turkish-blue-600)] flex items-center justify-center text-white">
                  T
                </span>
                Tengra
              </span>
            </Link>
            <p className="text-[rgba(255,255,255,0.5)] leading-relaxed mb-6 max-w-xs">
              {t("brandDescription")}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/tengra" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/tengra" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/tengra" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">{t("company.title")}</h4>
            <ul className="space-y-4">
              <li><Link href={getHref("/about")} className="text-[rgba(255,255,255,0.5)] hover:text-[var(--color-turkish-blue-400)] transition-colors">{t("company.about")}</Link></li>
              <li><Link href={getHref("/careers")} className="text-[rgba(255,255,255,0.5)] hover:text-[var(--color-turkish-blue-400)] transition-colors">{t("company.careers")}</Link></li>
              <li><Link href={getHref("/blog")} className="text-[rgba(255,255,255,0.5)] hover:text-[var(--color-turkish-blue-400)] transition-colors">{t("company.blog")}</Link></li>
              <li><Link href={getHref("/contact")} className="text-[rgba(255,255,255,0.5)] hover:text-[var(--color-turkish-blue-400)] transition-colors">{t("company.contact")}</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">{t("services.title")}</h4>
            <ul className="space-y-4">
              <li><Link href={getHref("/services/web-development")} className="text-[rgba(255,255,255,0.5)] hover:text-[var(--color-turkish-blue-400)] transition-colors">{t("services.webDevelopment")}</Link></li>
              <li><Link href={getHref("/services/mobile-apps")} className="text-[rgba(255,255,255,0.5)] hover:text-[var(--color-turkish-blue-400)] transition-colors">{t("services.mobileApps")}</Link></li>
              <li><Link href={getHref("/services/cloud-infrastructure")} className="text-[rgba(255,255,255,0.5)] hover:text-[var(--color-turkish-blue-400)] transition-colors">{t("services.cloudInfrastructure")}</Link></li>
              <li><Link href={getHref("/services/design")} className="text-[rgba(255,255,255,0.5)] hover:text-[var(--color-turkish-blue-400)] transition-colors">{t("services.uiUxDesign")}</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">{t("newsletter.title")}</h4>
            <p className="text-[rgba(255,255,255,0.5)] text-sm mb-4">
              {t("newsletter.description")}
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder={t("newsletter.placeholder")}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[var(--color-turkish-blue-400)] transition-colors"
              />
              <AnimatedButton variant="primary" size="sm" className="w-full justify-center">
                {t("newsletter.button")} <ArrowRight className="ml-2 w-3 h-3" />
              </AnimatedButton>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[rgba(255,255,255,0.4)]">
            {t("copyright", { year: currentYear })}
          </p>
          <div className="flex items-center gap-6">
            <Link href={getHref("/privacy")} className="text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">{t("privacy")}</Link>
            <Link href={getHref("/terms")} className="text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">{t("terms")}</Link>
          </div>
          <p className="text-sm text-[rgba(255,255,255,0.3)] flex items-center gap-1">
            {t("madeWithPrefix")}
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            {t("madeWithSuffix", { city: t("city") })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
