"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Img from "../../../public/tengra_without_text.png";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed bottom-0 left-0 w-full z-50 glass backdrop-blur-xl border-t border-[rgba(255,255,255,0.1)]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 text-sm text-[color:var(--text-muted)]">
        {/* Sol taraf - logo */}
        <div className="flex items-center gap-3">
          <Image
            src={Img.src}
            alt="Tengra Symbol"
            width={50}
            height={50}
            className="opacity-80"
          />
          <span className="font-display text-[color:var(--color-turkish-blue-400)] text-lg tracking-widest soft-glow">
            TENGRA
          </span>
        </div>

        {/* Orta - bağlantılar */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/#goals"
            className="hover:text-[color:var(--color-turkish-blue-300)] transition-colors"
          >
            Goals
          </Link>
          <Link
            href="/#projects"
            className="hover:text-[color:var(--color-turkish-blue-300)] transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/#network"
            className="hover:text-[color:var(--color-turkish-blue-300)] transition-colors"
          >
            Network
          </Link>
          <Link
            href="/#team" 
            className="hover:text-[color:var(--color-turkish-blue-300)] transition-colors"
          > 
            Team
          </Link>
          <Link
            href="/blogs"
            className="hover:text-[color:var(--color-turkish-blue-300)] transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/forum"
            className="hover:text-[color:var(--color-turkish-blue-300)] transition-colors text-md"
          >
            Forum
          </Link>
        </div>

        {/* Sağ taraf - telif */}
        <div className="text-md text-[rgba(255,255,255,0.4)]">
          © {new Date().getFullYear()} Tengra Studio. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
}
