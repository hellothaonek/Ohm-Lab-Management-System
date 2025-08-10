import { Skeleton } from "./ui/skeleton"

export function LoadingSkeleton() {
    return (
        <div className="flex h-screen">
            {/* Sidebar skeleton */}
            <div className="w-64 border-r p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            {/* Main content skeleton */}
            <div className="flex-1 p-4 space-y-4">
                {/* Header skeleton */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-4 w-px" />
                    <Skeleton className="h-6 w-40" />
                </div>
                {/* Main content skeleton */}
                <Skeleton className="h-64 w-full" />
                {/* Footer skeleton */}
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    )
}