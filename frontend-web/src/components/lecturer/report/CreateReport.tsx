"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createReport, getTodaySlots } from "@/services/reportServices"

interface CreateReportProps {
    isOpen: boolean
    onClose: () => void
    onReportCreated: () => void
}

export default function CreateReport({ isOpen, onClose, onReportCreated }: CreateReportProps) {
    const [formData, setFormData] = useState({
        reportTitle: "",
        reportDescription: "",
        selectedSlot: "",
        selectedClass: "",
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [slots, setSlots] = useState<{ slotName: string }[]>([])

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const data = await getTodaySlots()
                if (data?.slots?.length > 0) {
                    setFormData((prev) => ({ ...prev, selectedSlot: data.slots[0].slotName }))
                    setSlots(data.slots)
                } else {
                    setSlots([])
                    setFormData((prev) => ({ ...prev, selectedSlot: "" }))
                }
            } catch (err) {
                setError("Failed to fetch slots. Please try again.")
                console.error(err)
            }
        }
        if (isOpen) fetchSlots()
    }, [isOpen])

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        setError(null)
        setLoading(true)
        try {
            await createReport(formData)
            onReportCreated()
            setFormData({ reportTitle: "", reportDescription: "", selectedSlot: "", selectedClass: "" })
            onClose()
        } catch (err) {
            setError("Failed to create report. Please try again.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Report</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reportTitle">Report Title</Label>
                        <Input
                            id="reportTitle"
                            name="reportTitle"
                            value={formData.reportTitle}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                            placeholder="Enter report title"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reportDescription">Description</Label>
                        <Textarea
                            id="reportDescription"
                            name="reportDescription"
                            value={formData.reportDescription}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                            placeholder="Enter report description"
                            rows={4}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="selectedSlot">Slot</Label>
                        <Select
                            name="selectedSlot"
                            value={formData.selectedSlot}
                            onValueChange={(value) => handleChange("selectedSlot", value)}
                            required
                        >
                            <SelectTrigger id="selectedSlot">
                                <SelectValue placeholder={slots.length === 0 ? "No slots available" : "Select a slot"} />
                            </SelectTrigger>
                            <SelectContent>
                                {slots.length === 0 ? null : (
                                    slots.map((slot) => (
                                        <SelectItem key={slot.slotName} value={slot.slotName}>
                                            {slot.slotName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="selectedClass">Class</Label>
                        <Select
                            name="selectedClass"
                            value={formData.selectedClass}
                            onValueChange={(value) => handleChange("selectedClass", value)}
                            required
                        >
                            <SelectTrigger id="selectedClass">
                                <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CS101">CS101</SelectItem>
                                <SelectItem value="CS102">CS102</SelectItem>
                                <SelectItem value="CS201">CS201</SelectItem>
                                <SelectItem value="CS202">CS202</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Submitting..." : "Create Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}