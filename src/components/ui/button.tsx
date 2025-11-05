import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-all disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    // Glass + ring focus styled by tokens
    "outline-none focus-visible:ring-[3px] focus-visible:ring-[color:var(--ring)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[color:var(--color-turkish-blue-500)] text-[color:var(--text-invert)]",
          "shadow-[var(--glow-soft)] hover:bg-[color:var(--color-turkish-blue-400)] hover:shadow-[var(--glow-strong)]",
        ].join(" "),
        destructive: [
          "bg-[color:var(--color-danger)] text-white hover:bg-[color:var(--color-danger)]/90",
          "focus-visible:ring-[color:var(--color-danger)]/30",
        ].join(" "),
        outline: [
          "border border-[rgba(0,167,197,0.35)] bg-[rgba(3,12,18,0.6)] text-[color:var(--color-turkish-blue-100)]",
          "hover:bg-[rgba(0,167,197,0.12)]",
        ].join(" "),
        secondary: [
          "bg-[rgba(255,255,255,0.06)] text-[color:var(--text-primary)]",
          "hover:bg-[rgba(255,255,255,0.1)]",
        ].join(" "),
        ghost: "text-[color:var(--color-turkish-blue-200)] hover:bg-[rgba(0,167,197,0.12)]",
        link: "text-[color:var(--color-turkish-blue-400)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
