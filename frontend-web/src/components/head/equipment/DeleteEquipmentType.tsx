"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { deleteEquipmentType } from "@/services/equipmentTypeServices"
import { useState } from "react"

interface DeleteEquipmentTypeProps {
    equipmentTypeId: string
    equipmentTypeName: string
    onClose: () => void
    onSuccess: () => void
}

export default function DeleteEquipmentType({
    equipmentTypeId,
    equipmentTypeName,
    onClose,
    onSuccess
}: DeleteEquipmentTypeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleDelete = async () => {
        setIsSubmitting(true)
        try {
            await deleteEquipmentType(equipmentTypeId)
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error deleting equipment type:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete equipment type. Please try again."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Are you sure you want to delete the equipment type <span className="font-medium">{equipmentTypeName}</span>?
                This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Deleting..." : "Delete"}
                </Button>
            </div>
        </div>
    )
}