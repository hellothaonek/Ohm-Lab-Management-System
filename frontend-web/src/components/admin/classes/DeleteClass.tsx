"use client"

import { useState } from "react"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { deleteClass } from "../../../services/classServices"
import { toast } from "react-toastify"
import { Class } from "../../../types/class"

interface DeleteClassProps {
    classItem: Class | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function DeleteClass({ classItem, isOpen, onOpenChange, onSuccess }: DeleteClassProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!classItem) return

        try {
            setLoading(true)
            await deleteClass(classItem.classId.toString())
            onSuccess()
        } catch (error) {
            console.error("Error deleting class:", error)
        } finally {
            setLoading(false)
            onOpenChange(false)
        }
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    if (!classItem) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Class</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{classItem.className}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting..." : "Delete Class"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
