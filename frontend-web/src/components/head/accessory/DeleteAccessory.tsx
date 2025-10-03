"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteAccessory } from "@/services/accessoryServices"
import { useToast } from "@/components/ui/use-toast"

interface DeleteAccessoryProps {
    open: boolean
    onClose: () => void
    onDelete: () => void
    accessoryId: number
    accessoryName: string
}

export default function DeleteAccessory({ open, onClose, onDelete, accessoryId, accessoryName }: DeleteAccessoryProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const handleDelete = async () => {
        setIsLoading(true)
        setError(null)

        try {
            await deleteAccessory(accessoryId)
            onDelete()
            onClose()
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to delete accessory"
            setError(errorMessage)
            console.error("Error deleting accessory:", err)
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Accessory</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete the accessory <strong>{accessoryName}</strong>? This action cannot be undone.
                    </p>
                    {error && (
                        <div className="mt-4 text-center text-red-500">
                            {error}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}