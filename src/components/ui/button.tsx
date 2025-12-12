import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
    "transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-turkish-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-900)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] text-white",
          "shadow-[0_4px_20px_rgba(30,184,255,0.25)] hover:shadow-[0_6px_30px_rgba(30,184,255,0.35)]",
          "hover:scale-[1.02] active:scale-[0.98]",
        ].join(" "),
        destructive: [
          "bg-gradient-to-r from-red-500 to-red-600 text-white",
          "shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.35)]",
          "hover:scale-[1.02] active:scale-[0.98]",
        ].join(" "),
        outline: [
          "border border-[rgba(72,213,255,0.25)] bg-[rgba(15,31,54,0.5)] text-[var(--color-turkish-blue-300)]",
          "backdrop-blur-sm hover:bg-[rgba(30,184,255,0.1)] hover:border-[rgba(72,213,255,0.4)]",
        ].join(" "),
        secondary: [
          "bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-300)] border border-[rgba(72,213,255,0.15)]",
          "hover:bg-[rgba(30,184,255,0.15)] hover:border-[rgba(72,213,255,0.25)]",
        ].join(" "),
        ghost: [
          "text-[var(--color-turkish-blue-300)]",
          "hover:bg-[rgba(30,184,255,0.1)]",
        ].join(" "),
        link: "text-[var(--color-turkish-blue-400)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
