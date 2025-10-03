"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createEquipmentType } from "@/services/equipmentTypeServices"
import { useUploadImage } from "@/hooks/useUploadImage" // 1. IMPORT HOOK

interface CreateEquipmentTypeProps {
    onClose: () => void
    onSuccess: () => void
}

export default function CreateEquipmentType({ onClose, onSuccess }: CreateEquipmentTypeProps) {
    const [formData, setFormData] = useState({
        equipmentTypeName: "",
        equipmentTypeCode: "",
        equipmentTypeDescription: "",
        equipmentTypeUrlImg: "" // Đây sẽ nhận URL từ Cloudinary
    })

    // State để lưu File object
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null) // Dùng cho preview

    // 2. SỬ DỤNG HOOK UPLOAD 
    const { uploadImage, loading: isImageUploading, error: uploadError } = useUploadImage()


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Kiểm tra nếu đang upload ảnh, ngăn không cho submit
        if (isImageUploading) {
            toast({ title: "Wait", description: "Image is still uploading. Please wait.", variant: "default" });
            return;
        }

        setIsSubmitting(true)

        try {
            let finalImageUrl = formData.equipmentTypeUrlImg

            // 3. THỰC HIỆN UPLOAD ẢNH NẾU CÓ FILE MỚI
            if (imageFile) {
                toast({ title: "Uploading image...", description: "Vui lòng chờ ảnh được upload lên Cloudinary." })

                // Gói hàm upload vào Promise để dùng await
                finalImageUrl = await new Promise<string>((resolve, reject) => {
                    uploadImage({
                        file: imageFile,
                        onSuccess: resolve,
                        onError: (errorMsg) => reject(new Error(errorMsg)),
                    })
                })
            }

            // 4. GỌI SERVICE TẠO THIẾT BỊ VỚI URL ẢNH
            const dataToCreate = {
                ...formData,
                equipmentTypeUrlImg: finalImageUrl // Gán URL đã upload
            }

            await createEquipmentType(dataToCreate)
            onSuccess()
            onClose()
            // Tost thành công được xử lý trong service createEquipmentType

        } catch (error: any) {
            // Xử lý lỗi từ cả upload và service
            const errorMessage = uploadError || error.message || "Failed to create equipment type. Please try again."

            console.error("Error creating equipment type:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
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

    // 5. CẬP NHẬT: Chỉ lưu trữ File object và tạo URL tạm thời cho Preview
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file) // Lưu trữ File object
            // Tạo URL tạm thời (Blob URL) cho mục đích preview
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setImageFile(null)
            setPreviewImage(null)
        }
    }

    // 6. Cập nhật nút Submit
    const isProcessing = isSubmitting || isImageUploading

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Các trường input khác giữ nguyên */}
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

            {/* Phần Image Upload đã được cập nhật */}
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
                            // Sử dụng Blob URL cho preview
                            src={previewImage}
                            alt="Equipment preview"
                            className="h-32 w-auto object-cover rounded"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Create"}
                </Button>
            </div>
        </form>
    )
}