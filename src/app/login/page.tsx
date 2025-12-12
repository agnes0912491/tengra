import { Suspense } from "react";
import type { Metadata } from "next";

import LoginForm from "./LoginForm";

export const metadata: Metadata = {
    title: "TENGRA | Giriş Yap",
    description: "TENGRA hesabınıza giriş yapın.",
    alternates: {
        canonical: "/login",
    },
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-[var(--color-turkish-blue-400)] border-t-transparent rounded-full" />
        </div>}>
            <LoginForm />
        </Suspense>
    );
}
