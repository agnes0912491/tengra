"use client";

import { useTranslation } from "@tengra/language";
import Link from "next/link";

export function TermsText() {
    const { t } = useTranslation("Auth");
    return (
        <p className="text-xs text-[var(--text-muted)]">
            {t("register.terms.prefix")}{" "}
            <Link href="/terms" className="text-[var(--color-turkish-blue-400)] hover:underline">
                {t("register.terms.termsLink")}
            </Link>{" "}
            {t("register.terms.and")}{" "}
            <Link href="/privacy" className="text-[var(--color-turkish-blue-400)] hover:underline">
                {t("register.terms.privacyLink")}
            </Link>{" "}
            {t("register.terms.suffix")}
        </p>
    );
}
