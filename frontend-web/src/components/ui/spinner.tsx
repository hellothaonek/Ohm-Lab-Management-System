import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
    className?: string
}

export function Spinner({ className }: SpinnerProps) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
    )
}