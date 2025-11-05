"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FieldSize = "sm" | "md";
type Variant = "dark" | "light";

type CommonProps = {
  label: string;
  className?: string;
  fieldSize?: FieldSize;
  variant?: Variant;
  error?: string;
  hint?: string;
} & ({ id?: string } & React.AriaAttributes);

const baseColors = (variant: Variant) => {
  if (variant === "light") {
    return {
      bg: "bg-white text-black",
      labelBg: "bg-white",
      border: "border-gray-300 focus:border-[rgba(0,167,197,0.8)]",
      labelText: "text-gray-700",
    } as const;
  }
  return {
    bg: "bg-[rgba(3,12,18,0.75)] text-white",
    labelBg: "bg-[rgba(3,12,18,0.92)]",
    border: "border-[rgba(0,167,197,0.35)] focus:border-[rgba(0,167,197,0.8)]",
    labelText: "text-[rgba(255,255,255,0.85)]",
  } as const;
};

const sizePad = (s: FieldSize) => (s === "sm" ? "px-2 py-1.5" : "px-3 py-2");

function FieldWrapper({
  children,
  label,
  hasValue,
  variant,
  fieldSize = "md",
  error,
  hint,
}: {
  children: React.ReactNode;
  label: string;
  hasValue: boolean;
  variant: Variant;
  fieldSize?: FieldSize;
  error?: string;
  hint?: string;
}) {
  const colors = baseColors(variant);
  return (
    <div className="relative">
      {children}
      <label
        className={cn(
          "pointer-events-none absolute left-2 -translate-y-1/2 transition-all",
          fieldSize === "sm" ? "top-1/2" : "top-1/2",
          hasValue ? "top-0" : ""
        )}
      >
        <span
          className={cn(
            "rounded-md border",
            fieldSize === "sm" ? "px-1 py-0 text-[10px]" : "px-1.5 py-0.5 text-sm",
            colors.labelText,
            colors.labelBg,
            hasValue
              ? "border-[rgba(0,167,197,0.8)] text-[color:var(--color-turkish-blue-200)] text-[11px]"
              : "border-transparent"
          )}
        >
          {label}
        </span>
      </label>
      {(error || hint) && (
        <p className={cn("mt-1 text-[11px]", error ? "text-red-400" : "text-[rgba(255,255,255,0.6)]")}>{error || hint}</p>
      )}
    </div>
  );
}

export function FloatingInput({ label, className, fieldSize = "md", variant = "dark", error, hint, ...props }: CommonProps & Omit<React.ComponentProps<"input">, "size">) {
  const hasValue = typeof props.value === "string" ? props.value.length > 0 : Boolean(props.defaultValue);
  const colors = baseColors(variant);
  const invalid = (props["aria-invalid"] as boolean | undefined) || Boolean(error);
  return (
    <FieldWrapper label={label} hasValue={hasValue} variant={variant} fieldSize={fieldSize} error={error} hint={hint}>
      <input
        {...props}
        className={cn(
          "peer w-full rounded-md placeholder-transparent outline-none transition",
          colors.bg,
          colors.border,
          sizePad(fieldSize),
          invalid && "border-red-500 focus:border-red-500",
          className
        )}
        placeholder={props.placeholder ?? label}
      />
    </FieldWrapper>
  );
}

export function FloatingTextarea({ label, className, fieldSize = "md", variant = "dark", error, hint, ...props }: CommonProps & React.ComponentProps<"textarea">) {
  const hasValue = typeof props.value === "string" ? props.value.length > 0 : Boolean(props.defaultValue);
  const colors = baseColors(variant);
  const invalid = (props["aria-invalid"] as boolean | undefined) || Boolean(error);
  return (
    <FieldWrapper label={label} hasValue={hasValue} variant={variant} fieldSize={fieldSize} error={error} hint={hint}>
      <textarea
        {...props}
        className={cn(
          "peer w-full min-h-[120px] rounded-md placeholder-transparent outline-none transition",
          colors.bg,
          colors.border,
          sizePad(fieldSize),
          className,
          invalid && "border-red-500 focus:border-red-500"
        )}
        placeholder={props.placeholder ?? label}
      />
    </FieldWrapper>
  );
}

export function FloatingSelect({ label, className, children, fieldSize = "md", variant = "dark", error, hint, ...props }: CommonProps & Omit<React.ComponentProps<"select">, "size">) {
  const hasValue = typeof props.value === "string" ? (props.value as string).length > 0 : Boolean(props.defaultValue);
  const colors = baseColors(variant);
  const invalid = (props["aria-invalid"] as boolean | undefined) || Boolean(error);
  return (
    <FieldWrapper label={label} hasValue={hasValue} variant={variant} fieldSize={fieldSize} error={error} hint={hint}>
      <select
        {...props}
        className={cn(
          "peer w-full rounded-md outline-none transition",
          colors.bg,
          colors.border,
          sizePad(fieldSize),
          className,
          invalid && "border-red-500 focus:border-red-500"
        )}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
