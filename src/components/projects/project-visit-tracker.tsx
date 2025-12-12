"use client";

import { useEffect } from "react";
import { recordProjectVisit } from "@/lib/db";

type Props = {
  projectId?: string;
};

export default function ProjectVisitTracker({ projectId }: Props) {
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    (async () => {
      try {
        const path =
          typeof window !== "undefined" ? window.location.pathname : undefined;
        const token =
          typeof window !== "undefined"
            ? window.localStorage.getItem("authToken") || undefined
            : undefined;

        if (cancelled) return;
        await recordProjectVisit(projectId, path, token);
      } catch {
        // analytics failures shouldn't block the UI
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return null;
}

