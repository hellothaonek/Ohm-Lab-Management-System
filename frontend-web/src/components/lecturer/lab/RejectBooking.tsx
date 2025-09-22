"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { rejectRegistrationSchedule } from "@/services/registrationScheduleServices"
import { toast } from "sonner"

interface RejectBookingProps {
    registrationScheduleId: number
    onRejectSuccess: () => void
}

export function RejectBooking({ registrationScheduleId, onRejectSuccess }: RejectBookingProps) {
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [rejectNote, setRejectNote] = useState("")

    const handleConfirmReject = async () => {
        try {
            await rejectRegistrationSchedule({
                registrationScheduleId,
                registrationScheduleNote: rejectNote || "", 
            })
            setIsRejectDialogOpen(false)
            setRejectNote("")
            onRejectSuccess()
        } catch (error) {
            toast.error("Failed to reject booking request.")
        }
    }

    return (
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Reject booking"
                    onClick={() => setIsRejectDialogOpen(true)}
                >
                    <X className="h-4 w-4 text-red-500" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Booking</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        placeholder="Enter reason for rejection..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsRejectDialogOpen(false)
                            setRejectNote("")
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmReject}
                        disabled={!rejectNote.trim()} // Disable if note is empty
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}