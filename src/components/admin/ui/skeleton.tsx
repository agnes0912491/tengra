"use client";

export default function Skeleton({ className = "h-4 w-24" }: { className?: string }) {
  return <div className={["animate-pulse rounded bg-[rgba(255,255,255,0.08)]", className].join(" ")} />;
}

