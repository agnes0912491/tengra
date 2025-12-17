"use client";

import React from "react";
import { cn } from "@/lib/utils";

type GradientTextProps = {
    children: React.ReactNode;
    className?: string;
    from?: string;
    to?: string;
    direction?: "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl";
};

export default function GradientText({
    children,
    className,
    from = "from-[color:var(--color-turkish-blue-400)]",
    to = "to-[color:var(--color-turkish-blue-600)]",
    direction = "to-r",
}: GradientTextProps) {
    return (
        <span
            className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r",
                direction === "to-r" && "bg-gradient-to-r",
                direction === "to-l" && "bg-gradient-to-l",
                direction === "to-b" && "bg-gradient-to-b",
                direction === "to-t" && "bg-gradient-to-t",
                direction === "to-br" && "bg-gradient-to-br",
                direction === "to-bl" && "bg-gradient-to-bl",
                direction === "to-tr" && "bg-gradient-to-tr",
                direction === "to-tl" && "bg-gradient-to-tl",
                from,
                to,
                className
            )}
        >
            {children}
        </span>
    );
}
