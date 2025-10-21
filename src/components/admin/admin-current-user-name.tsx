"use client";

import { ReactNode } from "react";

import { useAuth } from "@/components/providers/auth-provider";

type Props = {
  fallback?: ReactNode;
};

export default function AdminCurrentUserName({ fallback = "—" }: Props) {
  const { user } = useAuth();

  const displayName = user?.displayName?.trim();
  const username = user?.username?.trim();

  return <>{displayName || username || fallback}</>;
}
