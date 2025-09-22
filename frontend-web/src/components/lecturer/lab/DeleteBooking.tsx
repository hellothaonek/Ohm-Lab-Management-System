"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteRegistrationSchedule } from "@/services/registrationScheduleServices"
import { toast } from "sonner"

interface DeleteBookingProps {
    registrationScheduleId: number
    onDeleteSuccess: () => void
}

export function DeleteBooking({ registrationScheduleId, onDeleteSuccess }: DeleteBookingProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const handleConfirmDelete = async () => {
        try {
            await deleteRegistrationSchedule(registrationScheduleId.toString())
            setIsDeleteDialogOpen(false)
            onDeleteSuccess()
            toast.success("Booking deleted successfully.")
        } catch (error) {
            toast.error("Failed to delete booking request.")
        }
    }

    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Delete booking"
                    onClick={() => setIsDeleteDialogOpen(true)}
                >
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Booking</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>Are you sure you want to delete this booking request? This action cannot be undone.</p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmDelete}
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}