"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarPlus2 } from "lucide-react"
import { createRegistrationSchedule, listSlotEmptyByDate } from "@/services/registrationScheduleServices"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext"

interface CreateLabBookingProps {
    labId: number | null
    classId: number
    className: string
    labName: string | null
    open: boolean
    onClose: () => void
    onBookingCreated?: () => void
}

interface Slot {
    slotId: number
    slotName: string
}

export default function CreateLabBooking({ labId, classId, className, labName, open, onClose, onBookingCreated }: CreateLabBookingProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        registrationScheduleName: "",
        classId: classId.toString(),
        labId: labId ? labId.toString() : "",
        slotId: "",
        registrationScheduleDate: "",
        registrationScheduleDescription: "",
    })
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
    const today = new Date().toISOString().split("T")[0]

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            classId: classId.toString(),
            labId: labId ? labId.toString() : "",
        }))
    }, [classId, labId])

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (formData.registrationScheduleDate) {
                try {
                    const slots = await listSlotEmptyByDate(formData.registrationScheduleDate)
                    setAvailableSlots(slots)
                } catch (error) {
                    toast.error("Failed to fetch available slots.")
                    setAvailableSlots([])
                }
            } else {
                setAvailableSlots([])
            }
        }
        fetchAvailableSlots()
    }, [formData.registrationScheduleDate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.userId) {
            toast.error("User ID not found. Please log in again.")
            return
        }
        if (!formData.labId || !formData.classId || !formData.slotId || !formData.registrationScheduleDate) {
            toast.error("Please fill in all required fields.")
            return
        }

        try {
            await createRegistrationSchedule({
                registrationScheduleName: formData.registrationScheduleName,
                teacherId: user.userId,
                classId: parseInt(formData.classId),
                labId: parseInt(formData.labId),
                slotId: parseInt(formData.slotId),
                registrationScheduleDate: formData.registrationScheduleDate,
                registrationScheduleDescription: formData.registrationScheduleDescription,
            })
            onClose()
            setFormData({
                registrationScheduleName: "",
                classId: classId.toString(),
                labId: labId ? labId.toString() : "",
                slotId: "",
                registrationScheduleDate: "",
                registrationScheduleDescription: "",
            })
            if (onBookingCreated) onBookingCreated()
            toast.success("Lab booking created successfully.")
        } catch (error) {
            toast.error("Failed to create lab booking.")
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Lab Booking</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="registrationScheduleName">Schedule Name</Label>
                        <Input
                            id="registrationScheduleName"
                            name="registrationScheduleName"
                            value={formData.registrationScheduleName}
                            onChange={handleInputChange}
                            placeholder="Enter schedule name"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="className">Class</Label>
                        <Input
                            id="className"
                            name="className"
                            value={className}
                            disabled
                            placeholder="Class name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="labName">Lab</Label>
                        <Input
                            id="labName"
                            name="labName"
                            value={labName || "No lab selected"}
                            disabled
                            placeholder="Lab name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="registrationScheduleDate">Date</Label>
                        <Input
                            id="registrationScheduleDate"
                            name="registrationScheduleDate"
                            type="date"
                            value={formData.registrationScheduleDate}
                            onChange={handleInputChange}
                            min={today}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="slotId">Time Slot</Label>
                        <Select
                            name="slotId"
                            value={formData.slotId}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, slotId: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableSlots.length > 0 ? (
                                    availableSlots.map((slot) => (
                                        <SelectItem key={slot.slotId} value={slot.slotId.toString()}>
                                            {slot.slotName}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-slots" disabled>
                                        No slots available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="registrationScheduleDescription">Description</Label>
                        <Input
                            id="registrationScheduleDescription"
                            name="registrationScheduleDescription"
                            value={formData.registrationScheduleDescription}
                            onChange={handleInputChange}
                            placeholder="Enter description (optional)"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}