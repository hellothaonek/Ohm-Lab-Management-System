"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { updateClassStatus } from "@/services/classServices"

interface DeleteClassProps {
    open: boolean
    onClose: () => void
    onDelete: () => void
    classId: string
    className: string
}

export default function DeleteClass({ open, onClose, onDelete, classId, className }: DeleteClassProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDeactivate = async () => {
        try {
            setLoading(true)
            await updateClassStatus(classId, "Inactive")
            onDelete()
            onClose()
        } catch (err) {
            setError("Failed to deactivate class")
            console.error("Error deactivating class:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Class</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to deactivate the class "{className}"? This will set the class status to Inactive.
                    </DialogDescription>
                </DialogHeader>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeactivate}
                        disabled={loading}
                    >
                        {loading ? "Deactivating..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}