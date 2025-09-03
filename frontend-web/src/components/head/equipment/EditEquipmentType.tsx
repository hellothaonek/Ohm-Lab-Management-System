"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateEquipmentType } from "@/services/equipmentTypeServices"

interface EditEquipmentTypeProps {
    equipmentType: {
        equipmentTypeId: string
        equipmentTypeName: string
        equipmentTypeCode: string
        equipmentTypeDescription?: string
        equipmentTypeQuantity: number
        equipmentTypeUrlImg?: string
        equipmentTypeStatus: string
    }
    onClose: () => void
    onSuccess: () => void
}

export default function EditEquipmentType({ equipmentType, onClose, onSuccess }: EditEquipmentTypeProps) {
    const [formData, setFormData] = useState({
        equipmentTypeName: equipmentType.equipmentTypeName,
        equipmentTypeCode: equipmentType.equipmentTypeCode,
        equipmentTypeDescription: equipmentType.equipmentTypeDescription || "",
        equipmentTypeQuantity: equipmentType.equipmentTypeQuantity,
        equipmentTypeUrlImg: equipmentType.equipmentTypeUrlImg || "",
        equipmentTypeStatus: equipmentType.equipmentTypeStatus
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await updateEquipmentType(equipmentType.equipmentTypeId, {
                ...formData,
                equipmentTypeQuantity: Number(formData.equipmentTypeQuantity)
            })
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error updating equipment type:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update equipment type. Please try again."
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
                <Label htmlFor="equipmentTypeQuantity">Quantity</Label>
                <Input
                    id="equipmentTypeQuantity"
                    name="equipmentTypeQuantity"
                    type="number"
                    min="0"
                    value={formData.equipmentTypeQuantity}
                    onChange={handleChange}
                    required
                    placeholder="Enter quantity"
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
            <div>
                <Label htmlFor="equipmentTypeStatus">Status</Label>
                <Select
                    name="equipmentTypeStatus"
                    value={formData.equipmentTypeStatus}
                    onValueChange={(value) => setFormData({ ...formData, equipmentTypeStatus: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="InUse">In Use</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Damaged">Damaged</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update"}
                </Button>
            </div>
        </form>
    )
}