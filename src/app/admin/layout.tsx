import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";

// Admin layout - just passes through to child routes
// Auth protection is handled in AdminShell component for /dashboard routes
// and directly in page components for other admin routes

export const metadata: Metadata = buildPageMetadata({
  title: "Admin | Tengra Studio",
  description: "Administration entry point for Tengra Studio.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
