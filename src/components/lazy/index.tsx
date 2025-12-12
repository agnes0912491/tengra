"use client";

import dynamic from "next/dynamic";
import { ComponentType, ReactNode } from "react";

// Loading skeleton components
export const CardSkeleton = () => (
    <div className="animate-pulse rounded-2xl border border-[rgba(110,211,225,0.1)] bg-[rgba(6,20,27,0.6)] p-6">
        <div className="h-4 bg-[rgba(110,211,225,0.1)] rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-[rgba(110,211,225,0.1)] rounded w-1/2"></div>
    </div>
);

export const ChartSkeleton = () => (
    <div className="animate-pulse rounded-2xl border border-[rgba(110,211,225,0.1)] bg-[rgba(6,20,27,0.6)] p-6">
        <div className="h-4 bg-[rgba(110,211,225,0.1)] rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-[rgba(110,211,225,0.05)] rounded"></div>
    </div>
);

export const TableSkeleton = () => (
    <div className="animate-pulse rounded-2xl border border-[rgba(110,211,225,0.1)] bg-[rgba(6,20,27,0.6)] p-6">
        <div className="h-4 bg-[rgba(110,211,225,0.1)] rounded w-1/4 mb-6"></div>
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-4">
                <div className="h-4 bg-[rgba(110,211,225,0.05)] rounded w-1/3"></div>
                <div className="h-4 bg-[rgba(110,211,225,0.05)] rounded w-1/4"></div>
                <div className="h-4 bg-[rgba(110,211,225,0.05)] rounded w-1/6"></div>
            </div>
        ))}
    </div>
);

export const FullPageSkeleton = () => (
    <div className="animate-pulse p-6 space-y-6">
        <div className="h-8 bg-[rgba(110,211,225,0.1)] rounded w-1/4"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
        <ChartSkeleton />
    </div>
);

// Lazy loaded components with custom loading states
export const LazyMetrics = dynamic(
    () => import("@/components/admin/dashboard/metrics"),
    {
        loading: () => (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
                <ChartSkeleton />
            </div>
        ),
        ssr: false,
    }
);

export const LazyActiveAgents = dynamic(
    () => import("@/components/admin/dashboard/active-agents"),
    {
        loading: () => <TableSkeleton />,
        ssr: false,
    }
);

export const LazyProjectsAdmin = dynamic(
    () => import("@/components/admin/projects/projects-admin"),
    {
        loading: () => <FullPageSkeleton />,
        ssr: false,
    }
);

export const LazyProjectEditForm = dynamic(
    () => import("@/components/admin/projects/project-edit-form"),
    {
        loading: () => <FullPageSkeleton />,
        ssr: false,
    }
);

export const LazyProjectsTable = dynamic(
    () => import("@/components/admin/projects/projects-table"),
    {
        loading: () => <TableSkeleton />,
        ssr: false,
    }
);

export const LazyUsersAdmin = dynamic(
    () => import("@/components/admin/users/users-admin").then(mod => ({ default: mod.UsersAdmin })),
    {
        loading: () => <FullPageSkeleton />,
        ssr: false,
    }
);

export const LazyBlogsAdmin = dynamic(
    () => import("@/components/admin/blogs/blogs-admin"),
    {
        loading: () => <FullPageSkeleton />,
        ssr: false,
    }
);

// Generic lazy wrapper for any component
export function createLazyComponent<P extends Record<string, unknown> = Record<string, unknown>>(
    importFn: () => Promise<{ default: ComponentType<P> }>,
    LoadingComponent: ReactNode = <CardSkeleton />
): ComponentType<P> {
    return dynamic(importFn, {
        loading: () => <>{LoadingComponent}</>,
        ssr: false,
    });
}
