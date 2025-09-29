"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEquipment } from "@/services/equipmentServices"
import { searchEquipmentType } from "@/services/equipmentTypeServices"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"

interface CreateEquipmentProps {
    open: boolean
    onClose: () => void
    onCreate: (data: {
        equipmentTypeId: string
        equipmentName: string
        equipmentNumberSerial: string
        equipmentDescription: string
        equipmentTypeUrlImg: string
    }) => void
}

interface EquipmentType {
    equipmentTypeId: string
    equipmentTypeName: string
    equipmentTypeStatus: string
}

export default function CreateEquipment({ open, onClose, onCreate }: CreateEquipmentProps) {
    const [equipmentData, setEquipmentData] = useState({
        equipmentTypeId: "",
        equipmentName: "",
        equipmentNumberSerial: "",
        equipmentDescription: "",
        equipmentTypeUrlImg: "",
    })
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])

    useEffect(() => {
        const fetchEquipmentTypes = async () => {
            try {
                const data = await searchEquipmentType({ pageNum: 1, pageSize: 100, keyWord: "", status: "" })
                setEquipmentTypes(data.pageData.filter((type: EquipmentType) => type.equipmentTypeStatus === "Available"))
            } catch (error) {
                toast.error("Failed to load equipment types")
            }
        }
        if (open) fetchEquipmentTypes()
    }, [open])

    const handleChange = (name: string, value: string) => {
        setEquipmentData((prev) => ({ ...prev, [name]: value }))
    }

    const resetForm = () => {
        setEquipmentData({
            equipmentTypeId: "",
            equipmentName: "",
            equipmentNumberSerial: "",
            equipmentDescription: "",
            equipmentTypeUrlImg: "",
        })
    }

    const isFormValid = () => {
        return (
            equipmentData.equipmentTypeId.trim() !== "" &&
            equipmentData.equipmentName.trim() !== "" &&
            equipmentData.equipmentNumberSerial.trim() !== "" &&
            equipmentData.equipmentDescription.trim() !== "" &&
            equipmentData.equipmentTypeUrlImg.trim() !== ""
        )
    }

    const handleSubmit = async () => {
        try {
            await createEquipment(equipmentData)
            onCreate(equipmentData)
            resetForm()
            onClose()
        } catch (error) {
            toast.error("Failed to create equipment")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Equipment</DialogTitle>
                    <DialogDescription>Enter the details for the new equipment.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentTypeId" className="text-right">Type ID</Label>
                        <Select
                            value={equipmentData.equipmentTypeId}
                            onValueChange={(value) => handleChange("equipmentTypeId", value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select Equipment Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {equipmentTypes.map((type) => (
                                    <SelectItem key={type.equipmentTypeId} value={type.equipmentTypeId}>
                                        {type.equipmentTypeName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentName" className="text-right">Name</Label>
                        <Input
                            id="equipmentName"
                            name="equipmentName"
                            value={equipmentData.equipmentName}
                            onChange={(e) => handleChange("equipmentName", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentNumberSerial" className="text-right">Serial Number</Label>
                        <Input
                            id="equipmentNumberSerial"
                            name="equipmentNumberSerial"
                            value={equipmentData.equipmentNumberSerial}
                            onChange={(e) => handleChange("equipmentNumberSerial", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentDescription" className="text-right">Description</Label>
                        <Input
                            id="equipmentDescription"
                            name="equipmentDescription"
                            value={equipmentData.equipmentDescription}
                            onChange={(e) => handleChange("equipmentDescription", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentTypeUrlImg" className="text-right">Image URL</Label>
                        <Input
                            id="equipmentTypeUrlImg"
                            name="equipmentTypeUrlImg"
                            value={equipmentData.equipmentTypeUrlImg}
                            onChange={(e) => handleChange("equipmentTypeUrlImg", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!isFormValid()}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}