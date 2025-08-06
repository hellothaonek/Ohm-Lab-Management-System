"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"
import { deleteKit } from "@/services/kitServices"
import { useToast } from "@/components/ui/use-toast"

interface DeleteKitProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kitId: string
    kitName: string
    onDeleteSuccess: () => void
}

export default function DeleteKit({ open, onOpenChange, kitId, kitName, onDeleteSuccess }: DeleteKitProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteKit(kitId)
            onDeleteSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to delete kit:", error)
            toast({
                title: "Error",
                description: "Failed to delete kit. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Delete Kit</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>Are you sure you want to delete the kit <span className="font-medium">{kitName}</span>?</p>
                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}