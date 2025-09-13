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
import { getAllScheduleTypes } from "@/services/scheduleTypeServices"

interface ScheduleType {
    scheduleTypeId: number
    scheduleTypeName: string
    scheduleTypeDow: string
    slotName: string
    slotStartTime: string
    slotEndTime: string
    scheduleTypeStatus: string
}

interface CreateLabBookingProps {
    labId: number | null
    classId: number | null
    open: boolean
    onClose: () => void
}

export default function CreateLabBooking({ labId, classId, open, onClose }: CreateLabBookingProps) {
    const [formData, setFormData] = useState({
        scheduleTypeId: 0,
        scheduleDescription: "",
        maxStudentsPerSession: 0,
        lecturerNotes: "",
        scheduledDate: "" // Added scheduledDate field
    })
    const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingScheduleTypes, setLoadingScheduleTypes] = useState(false)
    const [errorScheduleTypes, setErrorScheduleTypes] = useState<string | null>(null)

    useEffect(() => {
        const fetchScheduleTypes = async () => {
            try {
                setLoadingScheduleTypes(true)
                const response = await getAllScheduleTypes()
                const activeScheduleTypes = response.filter((scheduleType: ScheduleType) => scheduleType.scheduleTypeStatus === "Active")
                setScheduleTypes(activeScheduleTypes)
            } catch (error) {
                setErrorScheduleTypes("Failed to fetch schedule types")
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load available schedule types"
                })
            } finally {
                setLoadingScheduleTypes(false)
            }
        }

        if (open) {
            fetchScheduleTypes()
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

        if (!formData.scheduledDate) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select a scheduled date"
            })
            return
        }

        try {
            setLoading(true)
            await scheduleLab(labId.toString(), {
                classId,
                scheduledDate: new Date(formData.scheduledDate).toISOString(),
                scheduleTypeId: formData.scheduleTypeId,
                scheduleDescription: formData.scheduleDescription,
                maxStudentsPerSession: formData.maxStudentsPerSession,
                lecturerNotes: formData.lecturerNotes
            })
            onClose()
            setFormData({
                scheduleTypeId: 0,
                scheduleDescription: "",
                maxStudentsPerSession: 0,
                lecturerNotes: "",
                scheduledDate: ""
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

    const handleScheduleTypeChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            scheduleTypeId: parseInt(value)
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
                        <Label htmlFor="scheduleTypeId">Schedule Type</Label>
                        <Select
                            value={formData.scheduleTypeId.toString()}
                            onValueChange={handleScheduleTypeChange}
                            disabled={loadingScheduleTypes || !!errorScheduleTypes}
                        >
                            <SelectTrigger id="scheduleTypeId">
                                <SelectValue placeholder={loadingScheduleTypes ? "Loading schedule types..." : errorScheduleTypes ? "No schedule types available" : "Select a schedule type"} />
                            </SelectTrigger>
                            <SelectContent>
                                {scheduleTypes.map((scheduleType) => (
                                    <SelectItem key={scheduleType.scheduleTypeId} value={scheduleType.scheduleTypeId.toString()}>
                                        {`${scheduleType.scheduleTypeDow}, ${scheduleType.slotName} (${scheduleType.slotStartTime} - ${scheduleType.slotEndTime})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errorScheduleTypes && (
                            <p className="text-red-500 text-sm mt-1">{errorScheduleTypes}</p>
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
                        <Button type="submit" disabled={loading || loadingScheduleTypes || !!errorScheduleTypes}>
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