import { cn } from "@/lib/utils";

type SectionGradientProps = {
    position?: "top" | "bottom" | "both";
    className?: string;
    height?: "h-24" | "h-32" | "h-48" | "h-64";
};

export default function SectionGradient({
    position = "bottom",
    className,
    height = "h-48"
}: SectionGradientProps) {
    return (
        <>
            {(position === "top" || position === "both") && (
                <div
                    className={cn(
                        "absolute top-0 left-0 right-0 pointer-events-none z-0",
                        height,
                        "bg-gradient-to-b from-[var(--color-surface-900)] via-[var(--color-surface-900)]/80 to-transparent",
                        className
                    )}
                />
            )}
            {(position === "bottom" || position === "both") && (
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 pointer-events-none z-0",
                        height,
                        "bg-gradient-to-t from-[var(--color-surface-900)] via-[var(--color-surface-900)]/80 to-transparent",
                        className
                    )}
                />
            )}
        </>
    );
}
