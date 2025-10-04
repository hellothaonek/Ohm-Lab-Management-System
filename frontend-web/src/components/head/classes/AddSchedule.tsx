"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { getAvailableScheduleTypes } from "@/services/scheduleTypeServices"
import { addScheduleForClass } from "@/services/classServices"
import { toast } from "react-toastify"

interface ScheduleType {
    scheduleTypeId: number
    scheduleTypeDow: string
    slotName: string
    slotStartTime: string
    slotEndTime: string
    scheduleTypeStatus: string
}

interface AddScheduleProps {
    open: boolean
    onClose: () => void
    onAddSchedule: (schedule: { scheduleTypeId: number; classId: number }) => void
    classId: number
    className: string
}

export default function AddSchedule({ open, onClose, onAddSchedule, classId, className }: AddScheduleProps) {
    const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([])
    const [selectedScheduleTypeId, setSelectedScheduleTypeId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setSelectedScheduleTypeId("")
            setError(null)
        }
    }, [open])

    useEffect(() => {
        const fetchScheduleTypes = async () => {
            try {
                setLoading(true)
                const availableSchedules = await getAvailableScheduleTypes()
                setScheduleTypes(availableSchedules)
                setError(null)

                if (availableSchedules.length === 0) {
                    setError("No available schedule types are currently available.")
                }
            } catch (err) {
                console.error("Failed to fetch available schedule types:", err)
                setError("Failed to fetch available schedules. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        if (open) {
            fetchScheduleTypes()
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedScheduleTypeId) {
            try {
                setLoading(true)
                const scheduleData = {
                    scheduleTypeId: parseInt(selectedScheduleTypeId),
                    classId,
                }

                await addScheduleForClass(scheduleData)
                onAddSchedule(scheduleData)
                setSelectedScheduleTypeId("")
                onClose()
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || "Failed to add schedule."
                toast.error(errorMessage)
                onClose()
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Schedule for {className}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : error ? (
                            <p className="text-red-500 text-center">{error}</p>
                        ) : (
                            <Select
                                value={selectedScheduleTypeId}
                                onValueChange={setSelectedScheduleTypeId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day and time slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {scheduleTypes.map((scheduleType) => (
                                        <SelectItem
                                            key={scheduleType.scheduleTypeId}
                                            value={scheduleType.scheduleTypeId.toString()}
                                        >
                                            {scheduleType.scheduleTypeDow} ({scheduleType.slotStartTime}-{scheduleType.slotEndTime})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedScheduleTypeId || loading || !!error}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}