'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-white/5',
                className
            )}
        />
    );
}

/** Full-page skeleton for standalone pages (tojeong, compatibility, profile) */
export function PageSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center">
            <div className="w-full max-w-[430px] p-6 space-y-6 pt-16">
                {/* Header */}
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-60" />

                {/* Card */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>

                {/* Menu items */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

/** Result card skeleton (4 pillars) */
export function PillarsSkeleton() {
    return (
        <div className="grid grid-cols-4 gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-3 space-y-2 flex flex-col items-center">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-px w-4/5" />
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <Skeleton className="h-3 w-10" />
                </div>
            ))}
        </div>
    );
}
