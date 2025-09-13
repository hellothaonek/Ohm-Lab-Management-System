"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateReportStatus } from "@/services/reportServices"

interface Report {
    reportId: number
    reportStatus: string
    resolutionNotes: string | null
}

interface ChangeStatusProps {
    report: Report
    onClose: () => void
    onStatusUpdate: () => Promise<void>
    open: boolean
}

export default function ChangeStatus({ report, onClose, onStatusUpdate, open }: ChangeStatusProps) {
    const [status, setStatus] = useState<string>(report.reportStatus)
    const [resolutionNotes, setResolutionNotes] = useState<string>(report.resolutionNotes || "")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)
            await updateReportStatus(report.reportId.toString(), {
                reportStatus: status,
                resolutionNotes,
            })
            await onStatusUpdate()
            onClose()
        } catch (err) {
            setError("Failed to update report status. Please try again.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Update Report Status</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="status" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="resolutionNotes" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Resolution Notes
                        </Label>
                        <Textarea
                            id="resolutionNotes"
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Enter resolution notes..."
                            className="mt-1"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Updating..." : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}