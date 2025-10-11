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
      <div className="max-w-7xl mx-auto px-4 py-2 text-sm text-[color:var(--text-muted)]">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
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
          <div className="flex items-center gap-6">
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

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Top row - logo and copyright */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Image
                src={Img.src}
                alt="Tengra Symbol"
                width={30}
                height={30}
                className="opacity-80"
              />
              <span className="font-display text-[color:var(--color-turkish-blue-400)] text-sm tracking-widest soft-glow">
                TENGRA
              </span>
            </div>
            <div className="text-xs text-[rgba(255,255,255,0.4)]">
              © {new Date().getFullYear()}
            </div>
          </div>
          
          {/* Bottom row - navigation links */}
          <div className="flex items-center justify-center gap-4 text-xs">
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
              className="hover:text-[color:var(--color-turkish-blue-300)] transition-colors"
            >
              Forum
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
