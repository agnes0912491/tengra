"use client";

export default function EmptyState({ message = "Veri yok" }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.45)]/60 px-4 py-6 text-center text-[rgba(255,255,255,0.6)]">
      {message}
    </div>
  );
}

