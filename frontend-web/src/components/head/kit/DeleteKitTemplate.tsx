"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { deleteKitTemplate } from "@/services/kitTemplateServices"
import { useToast } from "@/components/ui/use-toast"

interface DeleteKitTemplateProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kitTemplateId: string
    kitTemplateName: string
    onSuccess: () => void
}

export default function DeleteKitTemplate({ open, onOpenChange, kitTemplateId, kitTemplateName }: DeleteKitTemplateProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteKitTemplate(kitTemplateId)
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete kit template",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Kit Template</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the kit template "{kitTemplateName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}