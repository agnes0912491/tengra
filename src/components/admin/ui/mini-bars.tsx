"use client";

type Item = { label: string; value: number };

export default function MiniBars({ items, maxHeight = 80 }: { items: Item[]; maxHeight?: number }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="mt-4 flex items-end gap-1 overflow-x-auto">
      {items.map((i) => (
        <div key={i.label} className="flex flex-col items-center text-[10px] text-[rgba(255,255,255,0.6)]">
          <div
            className="w-2 rounded bg-[color:var(--color-turkish-blue-400)]"
            style={{ height: `${Math.max(4, (i.value / max) * maxHeight)}px` }}
            title={`${i.label}: ${i.value}`}
          />
        </div>
      ))}
    </div>
  );
}

