"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { getAllScheduleTypes } from "@/services/scheduleTypeServices"
import { addScheduleForClass } from "@/services/classServices"
import { toast } from "react-toastify"

interface ScheduleType {
    scheduleTypeId: number
    scheduleTypeDow: string
    slotName: string
    slotStartTime: string
    slotEndTime: string
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
    const [selectedDow, setSelectedDow] = useState<string>("")
    const [selectedScheduleTypeId, setSelectedScheduleTypeId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchScheduleTypes = async () => {
            try {
                setLoading(true)
                const response = await getAllScheduleTypes()
                setScheduleTypes(response)
            } catch (err) {
                setError("Failed to fetch schedule types")
            } finally {
                setLoading(false)
            }
        }

        if (open) {
            fetchScheduleTypes()
        }
    }, [open])

    const daysOfWeek = useMemo(() => {
        const uniqueDows = [...new Set(scheduleTypes.map((type) => type.scheduleTypeDow))]
        return uniqueDows.map((dow) => ({ value: dow, label: dow }))
    }, [scheduleTypes])

    const availableSlots = useMemo(() => {
        return scheduleTypes.filter((type) => type.scheduleTypeDow === selectedDow)
    }, [scheduleTypes, selectedDow])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedScheduleTypeId && selectedDow) {
            try {
                setLoading(true)
                const scheduleData = {
                    scheduleTypeId: parseInt(selectedScheduleTypeId),
                    classId,
                }
                await addScheduleForClass(scheduleData)
                onAddSchedule(scheduleData)
                setSelectedDow("")
                setSelectedScheduleTypeId("")
                onClose()
            } catch (err: any) {
                const errorMessage = err.response?.data?.message
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
                            <>
                                <Select
                                    value={selectedDow}
                                    onValueChange={(value) => {
                                        setSelectedDow(value)
                                        setSelectedScheduleTypeId("")
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select day of week" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daysOfWeek.map((dow) => (
                                            <SelectItem key={dow.value} value={dow.value}>
                                                {dow.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={selectedScheduleTypeId}
                                    onValueChange={setSelectedScheduleTypeId}
                                    disabled={!selectedDow}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSlots.map((scheduleType) => (
                                            <SelectItem
                                                key={scheduleType.scheduleTypeId}
                                                value={scheduleType.scheduleTypeId.toString()}
                                            >
                                                {scheduleType.slotName} ({scheduleType.slotStartTime}-{scheduleType.slotEndTime})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!selectedScheduleTypeId || !selectedDow || loading}>
                            Add Schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}