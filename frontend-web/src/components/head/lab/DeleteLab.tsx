"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { deleteLab } from "@/services/labServices"

interface DeleteLabProps {
    lab: {
        labId: number
        labName: string
    } | null
    open: boolean
    onClose: () => void
    onDelete: () => void
}

export default function DeleteLab({ lab, open, onClose, onDelete }: DeleteLabProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        if (!lab) return

        try {
            setLoading(true)
            setError(null)
            await deleteLab(String(lab.labId))
            onDelete()
            onClose()
        } catch (err: any) {
            setError(err.message || "Failed to delete lab")
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Delete Lab</DialogTitle>
                </DialogHeader>

                {lab ? (
                    <div className="space-y-4">
                        <div className="text-sm">
                            <p>Are you sure you want to delete the lab <span className="font-semibold">{lab.labName}</span>?</p>
                            <p className="text-muted-foreground">This action cannot be undone.</p>
                        </div>

                        {error && <div className="text-red-500 text-sm">{error}</div>}

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-6">No lab data available.</p>
                )}
            </DialogContent>
        </Dialog>
    )
}