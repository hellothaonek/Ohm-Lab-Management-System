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

const slots = [
    "7:00 - 9:15",
    "9:30 - 11:45",
    "12:30 - 14:45",
    "15:00 - 17:15",
    "17:30 - 19:45",
    "20:00 - 22:15"
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ScheduleSkeleton() {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-[200px]" />
            </div>
            <div className="grid grid-cols-8 gap-px border rounded overflow-hidden text-center text-sm">
                <Skeleton className="bg-gray-100 font-bold p-2 h-12" />
                {days.map((d) => (
                    <div key={d} className="bg-gray-100 font-bold p-2">
                        <Skeleton className="h-6 w-10 mx-auto" />
                        <Skeleton className="h-4 w-16 mx-auto mt-2" />
                    </div>
                ))}
                {slots.map((time, slotIdx) => (
                    <div key={`slot-${slotIdx}`} className="contents">
                        <div className="bg-gray-100 p-2 min-h-[80px] flex items-center justify-center">
                            <Skeleton className="h-6 w-20" />
                        </div>
                        {days.map((d) => (
                            <div key={`${d}-${slotIdx}`} className="min-h-[80px]">
                                <Skeleton className="h-[80px] w-full" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}