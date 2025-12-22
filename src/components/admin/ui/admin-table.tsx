"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

export type SortDirection = "asc" | "desc" | null;

interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    width?: string;
    render?: (row: T, index: number) => ReactNode;
    className?: string;
}

interface AdminTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (row: T) => string | number;
    onSort?: (key: string, direction: SortDirection) => void;
    emptyMessage?: string;
    loading?: boolean;
    className?: string;
    stickyHeader?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    compact?: boolean;
}

export function AdminTable<T extends Record<string, unknown>>({
    data,
    columns,
    keyExtractor,
    onSort,
    emptyMessage,
    loading = false,
    className,
    stickyHeader = false,
    striped = false,
    hoverable = true,
    compact = false,
}: AdminTableProps<T>) {
    const t = useTranslations("AdminCommon");
    const resolvedEmptyMessage = emptyMessage ?? t("empty");
    const [sortState, setSortState] = useState<{ key: string; direction: SortDirection }>({
        key: "",
        direction: null,
    });

    const handleSort = (key: string) => {
        if (!onSort) return;
        let newDirection: SortDirection = "asc";
        if (sortState.key === key) {
            if (sortState.direction === "asc") newDirection = "desc";
            else if (sortState.direction === "desc") newDirection = null;
        }
        setSortState({ key, direction: newDirection });
        onSort(key, newDirection);
    };

    const getSortIcon = (key: string) => {
        if (sortState.key !== key) {
            return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
        }
        if (sortState.direction === "asc") return <ChevronUp className="h-3.5 w-3.5" />;
        if (sortState.direction === "desc") return <ChevronDown className="h-3.5 w-3.5" />;
        return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    };

    const cellPadding = compact ? "px-3 py-2" : "px-4 py-3.5";

    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-[rgba(72,213,255,0.1)] bg-[rgba(12,24,36,0.8)]",
                className
            )}
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead
                        className={cn(
                            "border-b border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)]",
                            stickyHeader && "sticky top-0 z-10"
                        )}
                    >
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    style={{ width: col.width }}
                                    className={cn(
                                        cellPadding,
                                        "text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]",
                                        col.sortable && "cursor-pointer select-none hover:text-[rgba(255,255,255,0.65)]",
                                        col.className
                                    )}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        {col.header}
                                        {col.sortable && getSortIcon(String(col.key))}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className={cn(cellPadding, "text-center")}>
                                        <div className="flex items-center justify-center gap-2 py-8 text-[rgba(255,255,255,0.5)]">
                                            <div className="h-5 w-5 border-2 border-[rgba(72,213,255,0.3)] border-t-[rgba(72,213,255,0.8)] rounded-full animate-spin" />
                                            {t("loading")}
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className={cn(cellPadding, "text-center text-[rgba(255,255,255,0.45)] py-12")}
                                    >
                                        {resolvedEmptyMessage}
                                    </td>
                                </tr>
                            ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={keyExtractor(row)}
                                    className={cn(
                                        "text-[rgba(255,255,255,0.85)] transition-colors",
                                        striped && rowIndex % 2 === 1 && "bg-[rgba(255,255,255,0.02)]",
                                        hoverable && "hover:bg-[rgba(72,213,255,0.04)]"
                                    )}
                                >
                                    {columns.map((col) => (
                                        <td key={String(col.key)} className={cn(cellPadding, col.className)}>
                                            {col.render
                                                ? col.render(row, rowIndex)
                                                : (row[col.key as keyof T] as ReactNode) ?? "-"}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Pagination component
interface AdminPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function AdminPagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: AdminPaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = pages.filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
    );

    const t = useTranslations("AdminCommon");

    return (
        <div className={cn("flex items-center justify-center gap-1 py-4", className)}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
                {t("previous")}
            </button>
            {visiblePages.map((page, i) => {
                const prev = visiblePages[i - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                    <span key={page} className="flex items-center">
                        {showEllipsis && (
                            <span className="px-2 text-[rgba(255,255,255,0.3)]">...</span>
                        )}
                        <button
                            onClick={() => onPageChange(page)}
                            className={cn(
                                "min-w-[32px] h-8 rounded-lg text-xs font-medium transition-all",
                                page === currentPage
                                    ? "bg-[rgba(72,213,255,0.15)] text-[rgba(130,226,255,0.95)] border border-[rgba(72,213,255,0.3)]"
                                    : "text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]"
                            )}
                        >
                            {page}
                        </button>
                    </span>
                );
            })}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
                {t("next")}
            </button>
        </div>
    );
}
