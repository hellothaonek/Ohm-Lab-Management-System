"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateKiAccessory } from "@/services/accessoryServices"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface UpdateAccessoryQuantityProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    accessory: {
        kitAccessoryId: number
        kitId: string
        accessoryId: number
        accessoryName: string
        currentAccessoryQuantity: number
    }
    onUpdate: () => void
}

export function UpdateAccessoryQuantity({ open, onOpenChange, accessory, onUpdate }: UpdateAccessoryQuantityProps) {
    const [quantity, setQuantity] = useState(accessory.currentAccessoryQuantity)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            await updateKiAccessory(accessory.kitAccessoryId.toString(), {
                kitId: accessory.kitId,
                accessoryId: accessory.accessoryId,
                accessoryQuantity: quantity,
                kitAccessoryStatus: "Valid"
            })
            onUpdate()
            onOpenChange(false)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update accessory quantity"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Quantity for {accessory.accessoryName}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Quantity
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="col-span-3"
                            min="0"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}