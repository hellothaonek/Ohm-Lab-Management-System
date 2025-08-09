"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createEquipmentType } from "@/services/equipmentTypeServices"

interface CreateEquipmentTypeProps {
    onClose: () => void
    onSuccess: () => void
}

export default function CreateEquipmentType({ onClose, onSuccess }: CreateEquipmentTypeProps) {
    const [formData, setFormData] = useState({
        equipmentTypeName: "",
        equipmentTypeCode: "",
        equipmentTypeDescription: "",
        equipmentTypeUrlImg: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await createEquipmentType(formData)
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error creating equipment type:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create equipment type. Please try again."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="equipmentTypeName">Equipment Type Name</Label>
                <Input
                    id="equipmentTypeName"
                    name="equipmentTypeName"
                    value={formData.equipmentTypeName}
                    onChange={handleChange}
                    required
                    placeholder="Enter equipment type name"
                />
            </div>
            <div>
                <Label htmlFor="equipmentTypeCode">Equipment Type Code</Label>
                <Input
                    id="equipmentTypeCode"
                    name="equipmentTypeCode"
                    value={formData.equipmentTypeCode}
                    onChange={handleChange}
                    required
                    placeholder="Enter equipment type code"
                />
            </div>
            <div>
                <Label htmlFor="equipmentTypeDescription">Description</Label>
                <Textarea
                    id="equipmentTypeDescription"
                    name="equipmentTypeDescription"
                    value={formData.equipmentTypeDescription}
                    onChange={handleChange}
                    placeholder="Enter equipment type description"
                />
            </div>
            <div>
                <Label htmlFor="equipmentTypeUrlImg">Image URL</Label>
                <Input
                    id="equipmentTypeUrlImg"
                    name="equipmentTypeUrlImg"
                    value={formData.equipmentTypeUrlImg}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create"}
                </Button>
            </div>
        </form>
    )
}