"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
type ModalPosition = "center" | "right"; // right = drawer style

interface AdminModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    description?: string;
    size?: ModalSize;
    position?: ModalPosition;
    showClose?: boolean;
    closeOnOverlay?: boolean;
    closeOnEscape?: boolean;
    footer?: ReactNode;
    className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-[95vw] max-h-[95vh]",
};

const positionStyles: Record<ModalPosition, { container: string; animation: object }> = {
    center: {
        container: "items-center justify-center",
        animation: {
            initial: { opacity: 0, scale: 0.95, y: 10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95, y: 10 },
        },
    },
    right: {
        container: "items-stretch justify-end",
        animation: {
            initial: { opacity: 0, x: "100%" },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: "100%" },
        },
    },
};

export function AdminModal({
    open,
    onClose,
    children,
    title,
    description,
    size = "md",
    position = "center",
    showClose = true,
    closeOnOverlay = true,
    closeOnEscape = true,
    footer,
    className,
}: AdminModalProps) {
    // Handle escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape" && closeOnEscape) {
                onClose();
            }
        },
        [closeOnEscape, onClose]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, handleEscape]);

    if (typeof window === "undefined") return null;

    const positionConfig = positionStyles[position];
    const isDrawer = position === "right";

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100]">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeOnOverlay ? onClose : undefined}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal container */}
                    <div className={cn("relative flex h-full w-full p-4", positionConfig.container)}>
                        <motion.div
                            {...positionConfig.animation}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={cn(
                                "relative flex flex-col overflow-hidden",
                                "bg-[rgba(10,22,34,0.98)] border border-[rgba(72,213,255,0.15)]",
                                "shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(72,213,255,0.05)]",
                                isDrawer
                                    ? "h-full w-full max-w-lg rounded-l-3xl"
                                    : cn("rounded-3xl w-full", sizeStyles[size]),
                                className
                            )}
                        >
                            {/* Header */}
                            {(title || showClose) && (
                                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[rgba(255,255,255,0.06)]">
                                    <div>
                                        {title && (
                                            <h2 className="text-xl font-semibold text-white">{title}</h2>
                                        )}
                                        {description && (
                                            <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">{description}</p>
                                        )}
                                    </div>
                                    {showClose && (
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-xl text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

                            {/* Footer */}
                            {footer && (
                                <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)]">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

// Convenience button components for modals
interface AdminModalButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    type?: "button" | "submit";
}

const buttonVariants = {
    primary:
        "bg-gradient-to-r from-[rgba(72,213,255,0.9)] to-[rgba(0,167,197,0.9)] text-black font-semibold shadow-[0_4px_20px_rgba(0,167,197,0.3)] hover:brightness-110",
    secondary:
        "bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.12)]",
    danger:
        "bg-red-500/80 text-white hover:bg-red-500/90 shadow-[0_4px_15px_rgba(239,68,68,0.2)]",
    ghost:
        "text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]",
};

export function AdminModalButton({
    children,
    onClick,
    variant = "primary",
    disabled = false,
    loading = false,
    className,
    type = "button",
}: AdminModalButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                buttonVariants[variant],
                className
            )}
        >
            {loading && (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}
