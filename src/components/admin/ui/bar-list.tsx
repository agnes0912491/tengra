"use client";

type Item = { id?: string; label: string; value: number };

export default function BarList({ items, emptyMessage = "Veri yok" }: { items: Item[]; emptyMessage?: string }) {
  if (!items || items.length === 0) {
    return <div className="text-[rgba(255,255,255,0.6)]">{emptyMessage}</div>;
  }
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {items.map((i) => {
        const width = Math.max(4, Math.round((i.value / max) * 100));
        return (
          <li key={i.id ?? i.label} className="relative overflow-hidden rounded-lg border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.6)] px-3 py-2">
            <div className="absolute inset-y-0 left-0 bg-[rgba(110,211,225,0.15)]" style={{ width: `${width}%` }} />
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-white truncate max-w-[70%]" title={i.label}>{i.label}</span>
              <span className="text-[rgba(255,255,255,0.9)]" title={`${i.value}`}>{i.value}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

