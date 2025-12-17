"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedButtonProps = HTMLMotionProps<"button"> & {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    className?: string;
};

const variants = {
    primary: "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    secondary: "bg-[rgba(110,211,225,0.1)] text-[color:var(--color-turkish-blue-300)] border border-[rgba(110,211,225,0.2)] hover:bg-[rgba(110,211,225,0.2)] hover:border-[rgba(110,211,225,0.4)] shadow-[0_0_20px_rgba(0,167,197,0.15)]",
    outline: "bg-transparent border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.3)] hover:text-white",
    ghost: "bg-transparent text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white",
};

const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
};

export default function AnimatedButton({
    children,
    className,
    variant = "primary",
    size = "md",
    ...props
}: AnimatedButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative rounded-xl font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[color:var(--color-turkish-blue-400)] flex items-center justify-center",
                variants[variant],
                sizes[size],
                "disabled:opacity-50 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed",
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}
