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
import { useUploadImage } from "@/hooks/useUploadImage" // Import hook upload

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
        equipmentTypeUrlImg: "", // Sẽ lưu URL cuối cùng từ Cloudinary
    })
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])

    // State quản lý file và UI
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Sử dụng Hook Upload
    const { uploadImage, loading: isImageUploading } = useUploadImage()

    useEffect(() => {
        const fetchEquipmentTypes = async () => {
            try {
                // Giả định searchEquipmentType trả về cấu trúc phù hợp
                const data = await searchEquipmentType({ pageNum: 1, pageSize: 100, keyWord: "", status: "" })
                setEquipmentTypes(data.pageData.filter((type: EquipmentType) => type.equipmentTypeStatus === "Available"))
            } catch (error) {
                toast.error("Failed to load equipment types")
            }
        }

        // Chỉ fetch khi dialog mở
        if (open) fetchEquipmentTypes()
    }, [open])

    const handleChange = (name: string, value: string) => {
        setEquipmentData((prev) => ({ ...prev, [name]: value }))
    }

    // Xử lý chọn file ảnh
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file) // Lưu trữ File object
            setPreviewImage(URL.createObjectURL(file)) // Tạo URL tạm thời cho preview
            handleChange("equipmentTypeUrlImg", "") // Đảm bảo URL ảnh cũ bị xóa
        } else {
            setImageFile(null)
            setPreviewImage(null)
        }
    }

    const resetForm = () => {
        setEquipmentData({
            equipmentTypeId: "",
            equipmentName: "",
            equipmentNumberSerial: "",
            equipmentDescription: "",
            equipmentTypeUrlImg: "",
        })
        setImageFile(null)
        setPreviewImage(null)
    }

    // Kiểm tra tính hợp lệ của Form (có thêm kiểm tra file nếu cần)
    const isFormValid = () => {
        // Yêu cầu phải có URL ảnh (nếu không có file mới) HOẶC phải có file mới
        const hasImage = equipmentData.equipmentTypeUrlImg.trim() !== "" || imageFile !== null

        return (
            equipmentData.equipmentTypeId.trim() !== "" &&
            equipmentData.equipmentName.trim() !== "" &&
            equipmentData.equipmentNumberSerial.trim() !== "" &&
            equipmentData.equipmentDescription.trim() !== "" &&
            hasImage
        )
    }

    const handleSubmit = async () => {
        // Ngăn chặn submit nếu đang upload
        if (isImageUploading) {
            toast.warning("Image is still uploading. Please wait.")
            return
        }

        setIsSubmitting(true)
        let finalImageUrl = equipmentData.equipmentTypeUrlImg

        try {
            // 1. UPLOAD ẢNH NẾU CÓ FILE MỚI
            if (imageFile) {
                finalImageUrl = await new Promise<string>((resolve, reject) => {
                    uploadImage({
                        file: imageFile,
                        onSuccess: resolve,
                        onError: (errorMsg) => reject(new Error(errorMsg)),
                    })
                })
            }

            const dataToCreate = {
                ...equipmentData,
                equipmentTypeUrlImg: finalImageUrl 
            }

            await createEquipment(dataToCreate)
            onCreate(dataToCreate)
            resetForm()
            onClose()

        } catch (error: any) {
            console.error("Error creating equipment:", error)
            const errorMessage = error.message || "Failed to create equipment."
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Trạng thái xử lý chung
    const isProcessing = isSubmitting || isImageUploading

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Equipment</DialogTitle>
                    <DialogDescription>Enter the details for the new equipment.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Input Select Type ID */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentTypeId" className="text-right">Type ID</Label>
                        <Select
                            value={equipmentData.equipmentTypeId}
                            onValueChange={(value) => handleChange("equipmentTypeId", value)}
                            disabled={isProcessing}
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

                    {/* Input Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentName" className="text-right">Name</Label>
                        <Input
                            id="equipmentName"
                            name="equipmentName"
                            value={equipmentData.equipmentName}
                            onChange={(e) => handleChange("equipmentName", e.target.value)}
                            className="col-span-3"
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Input Serial Number */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentNumberSerial" className="text-right">Serial Number</Label>
                        <Input
                            id="equipmentNumberSerial"
                            name="equipmentNumberSerial"
                            value={equipmentData.equipmentNumberSerial}
                            onChange={(e) => handleChange("equipmentNumberSerial", e.target.value)}
                            className="col-span-3"
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Input Description */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="equipmentDescription" className="text-right">Description</Label>
                        <Input
                            id="equipmentDescription"
                            name="equipmentDescription"
                            value={equipmentData.equipmentDescription}
                            onChange={(e) => handleChange("equipmentDescription", e.target.value)}
                            className="col-span-3"
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Input Image File và Preview */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="equipmentTypeImage" className="text-right pt-2">Image</Label>
                        <div className="col-span-3">
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
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid() || isProcessing}
                    >
                        {isProcessing ? "Processing..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}