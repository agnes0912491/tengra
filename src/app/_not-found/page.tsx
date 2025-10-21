"use client";

import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>{t("title")}</h1>
    </div>
  );
}
