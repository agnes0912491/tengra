import { Suspense } from "react";
import type { Metadata } from "next";

import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "TENGRA | Admin Girişi",
  description: "TENGRA yönetim paneline erişmek için giriş yapın.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/admin/login",
  },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
