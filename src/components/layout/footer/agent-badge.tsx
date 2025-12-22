"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

export function AgentBadge() {
  const [online, setOnline] = React.useState(false);
  const t = useTranslations("Footer");
  const [name, setName] = React.useState<string>(t("agentBadge.defaultName"));

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agent/status", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setOnline(Boolean(json?.online));
          if (typeof json?.name === "string") setName(json.name);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!online) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="chip">
        <span className="mr-1.5 inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
        {t("agentBadge.online", { name })}
      </span>
    </div>
  );
}
