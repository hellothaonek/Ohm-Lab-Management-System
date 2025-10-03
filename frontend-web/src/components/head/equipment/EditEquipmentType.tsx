"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateEquipmentType } from "@/services/equipmentTypeServices"
import { useUploadImage } from "@/hooks/useUploadImage" // Import hook upload

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
        equipmentTypeUrlImg: equipmentType.equipmentTypeUrlImg || "", // URL hiện tại
        equipmentTypeStatus: equipmentType.equipmentTypeStatus
    })

    // State mới cho việc upload ảnh
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null) // File mới được chọn
    const [previewImage, setPreviewImage] = useState<string | null>(equipmentType.equipmentTypeUrlImg || null) // URL preview (URL cũ hoặc Blob URL mới)

    // Sử dụng Hook Upload
    const { uploadImage, loading: isImageUploading, error: uploadError } = useUploadImage()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    // Xử lý chọn file ảnh
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file) // Lưu trữ File object mới
            // Tạo Blob URL cho mục đích preview
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setImageFile(null)
            // Nếu người dùng xóa file, revert về URL cũ
            setPreviewImage(equipmentType.equipmentTypeUrlImg || null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Ngăn chặn submit nếu đang upload ảnh
        if (isImageUploading) {
            toast({ title: "Wait", description: "Image is still uploading. Please wait.", variant: "default" });
            return;
        }

        setIsSubmitting(true)
        let finalImageUrl = formData.equipmentTypeUrlImg // Bắt đầu bằng URL hiện tại

        try {
            // BƯỚC 1: XỬ LÝ UPLOAD ẢNH MỚI
            if (imageFile) {
                // Gói hàm upload vào Promise để dùng await
                finalImageUrl = await new Promise<string>((resolve, reject) => {
                    uploadImage({
                        file: imageFile,
                        onSuccess: resolve,
                        onError: (errorMsg) => reject(new Error(errorMsg)),
                    })
                })
            }

            // BƯỚC 2: GỌI API UPDATE
            const dataToUpdate = {
                ...formData,
                equipmentTypeUrlImg: finalImageUrl, // Gán URL cuối cùng (mới hoặc cũ)
                equipmentTypeQuantity: Number(formData.equipmentTypeQuantity)
            }

            await updateEquipmentType(equipmentType.equipmentTypeId, dataToUpdate)
            onSuccess()
            onClose()

        } catch (error: any) {
            console.error("Error updating equipment type:", error)
            const errorMessage = uploadError || error.message || "Failed to update equipment type. Please try again."
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const isProcessing = isSubmitting || isImageUploading;

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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
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
                    disabled={isProcessing}
                />
            </div>

            <div>
                <Label htmlFor="equipmentTypeImage">Equipment Image</Label>
                <Input
                    id="equipmentTypeImage"
                    name="equipmentTypeImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                    disabled={isProcessing}
                />
                {previewImage && (
                    <div className="mt-2">
                        <img
                            src={previewImage}
                            alt="Equipment preview"
                            className="h-32 w-auto object-cover rounded"
                        />
                    </div>
                )}
            </div>

            <div>
                <Label htmlFor="equipmentTypeStatus">Status</Label>
                <Select
                    name="equipmentTypeStatus"
                    value={formData.equipmentTypeStatus}
                    onValueChange={(value) => setFormData({ ...formData, equipmentTypeStatus: value })}
                    disabled={isProcessing}
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
                <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Updating..." : "Update"}
                </Button>
            </div>
        </form>
    )
}