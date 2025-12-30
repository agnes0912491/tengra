import type { ReactNode } from "react";
import type { Metadata } from "next";
import AdminShell from "@/components/admin/admin-shell";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Admin Dashboard | Tengra Studio",
  description: "Tengra Studio admin dashboard for analytics and content.",
  path: "/admin/dashboard",
  noIndex: true,
});

export default async function AdminLayout({ children }: Props) {
  return <AdminShell>{children}</AdminShell>;
}
