"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { scheduleLab } from "@/services/labServices"
import { Loader2 } from "lucide-react"
import { getAllSlots } from "@/services/slotServices"

interface Slot {
    slotId: number
    slotName: string
}

interface CreateLabBookingProps {
    labId: number | null
    classId: number | null
    open: boolean
    onClose: () => void
}

export default function CreateLabBooking({ labId, classId, open, onClose }: CreateLabBookingProps) {
    const [formData, setFormData] = useState({
        scheduledDate: "",
        slotId: 1,
        scheduleDescription: "",
        maxStudentsPerSession: 0,
        lecturerNotes: ""
    })
    const [slots, setSlots] = useState<Slot[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [errorSlots, setErrorSlots] = useState<string | null>(null)

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                setLoadingSlots(true)
                const response = await getAllSlots()
                console.log("Res Slot", response)
                setSlots(response)
            } catch (error) {
                setErrorSlots("Failed to fetch slots")
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load available slots"
                })
            } finally {
                setLoadingSlots(false)
            }
        }

        if (open) {
            fetchSlots()
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!labId || !classId) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Missing lab or class information"
            })
            return
        }

        try {
            setLoading(true)
            await scheduleLab(labId.toString(), {
                classId,
                scheduledDate: formData.scheduledDate,
                slotId: formData.slotId,
                scheduleDescription: formData.scheduleDescription,
                maxStudentsPerSession: formData.maxStudentsPerSession,
                lecturerNotes: formData.lecturerNotes
            })
            onClose()
            setFormData({
                scheduledDate: "",
                slotId: 1,
                scheduleDescription: "",
                maxStudentsPerSession: 0,
                lecturerNotes: ""
            })
            toast({
                title: "Success",
                description: "Lab scheduled successfully"
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to schedule lab"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "maxStudentsPerSession" ? parseInt(value) || 0 : value
        }))
    }

    const handleSlotChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            slotId: parseInt(value)
        }))
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Lab Booking</DialogTitle>
                    <DialogDescription>Fill in the details to schedule a lab session</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                        <Input
                            id="scheduledDate"
                            name="scheduledDate"
                            type="date"
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="slotId">Slot</Label>
                        <Select
                            value={formData.slotId.toString()}
                            onValueChange={handleSlotChange}
                            disabled={loadingSlots || !!errorSlots}
                        >
                            <SelectTrigger id="slotId">
                                <SelectValue placeholder={loadingSlots ? "Loading slots..." : errorSlots ? "No slots available" : "Select a slot"} />
                            </SelectTrigger>
                            <SelectContent>
                                {slots.map((slot) => (
                                    <SelectItem key={slot.slotId} value={slot.slotId.toString()}>
                                        {slot.slotName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errorSlots && (
                            <p className="text-red-500 text-sm mt-1">{errorSlots}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="scheduleDescription">Description</Label>
                        <Input
                            id="scheduleDescription"
                            name="scheduleDescription"
                            value={formData.scheduleDescription}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="maxStudentsPerSession">Max Students</Label>
                        <Input
                            id="maxStudentsPerSession"
                            name="maxStudentsPerSession"
                            type="number"
                            min="0"
                            value={formData.maxStudentsPerSession}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="lecturerNotes">Lecturer Notes</Label>
                        <Input
                            id="lecturerNotes"
                            name="lecturerNotes"
                            value={formData.lecturerNotes}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || loadingSlots || !!errorSlots}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                "Schedule Lab"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}