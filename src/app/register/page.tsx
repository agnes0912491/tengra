import { Suspense } from "react";
import type { Metadata } from "next";

import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
    title: "TENGRA | Kayıt Ol",
    description: "TENGRA'ya üye olun ve topluluğa katılın.",
    alternates: {
        canonical: "/register",
    },
};

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-[var(--color-turkish-blue-400)] border-t-transparent rounded-full" />
        </div>}>
            <RegisterForm />
        </Suspense>
    );
}
