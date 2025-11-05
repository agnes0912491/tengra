"use client";

import { useCallback, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  onDrop: (files: File[]) => void | Promise<void>;
  children?: ReactNode;
};

export default function Dropzone({ accept, multiple, onDrop, children }: Props) {
  const [isOver, setIsOver] = useState(false);

  const handleInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length) await onDrop(files);
      e.target.value = "";
    },
    [onDrop]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };
  const onDragLeave = () => setIsOver(false);
  const onDropInternal = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length) await onDrop(files);
  };

  const acceptAttr = accept ? Object.keys(accept).join(",") : undefined;

  return (
    <label
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDropInternal}
      className={[
        "flex cursor-pointer items-center justify-center rounded-xl border p-4",
        "border-[rgba(0,167,197,0.35)] bg-[rgba(3,12,18,0.65)] text-white",
        "transition",
        isOver ? "border-[rgba(110,211,225,0.7)] bg-[rgba(6,20,27,0.8)]" : "",
      ].join(" ")}
    >
      <input
        type="file"
        className="hidden"
        accept={acceptAttr}
        multiple={multiple}
        onChange={handleInput}
      />
      {children}
    </label>
  );
}
