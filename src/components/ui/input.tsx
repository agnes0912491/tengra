import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 h-11 px-4 rounded-xl text-base md:text-sm",
        "bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)]",
        "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
        "backdrop-blur-sm transition-all duration-200",
        "focus:border-[var(--color-turkish-blue-500)] focus:ring-2 focus:ring-[rgba(30,184,255,0.2)] focus:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-[var(--text-primary)] file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
