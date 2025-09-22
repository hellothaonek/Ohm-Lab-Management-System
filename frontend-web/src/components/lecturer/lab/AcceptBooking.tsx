"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { acceptRegistrationSchedule } from "@/services/registrationScheduleServices"
import { toast } from "sonner"

interface AcceptBookingProps {
    registrationScheduleId: number
    registrationScheduleNote: string | null
    onAcceptSuccess: () => void
}

export function AcceptBooking({ registrationScheduleId, registrationScheduleNote, onAcceptSuccess }: AcceptBookingProps) {
    const handleAccept = async () => {
        try {
            await acceptRegistrationSchedule({
                registrationScheduleId,
                registrationScheduleNote: registrationScheduleNote || "",
            })
            onAcceptSuccess()
        } catch (error) {
            toast.error("Failed to accept booking request.")
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            title="Accept booking"
            onClick={handleAccept}
        >
            <Check className="h-4 w-4 text-green-500" />
        </Button>
    )
}