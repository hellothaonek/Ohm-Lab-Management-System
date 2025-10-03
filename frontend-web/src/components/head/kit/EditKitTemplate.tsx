"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea" // 👈 Thêm Textarea cho Description (nếu cần)
import { useState, useEffect } from "react" // 👈 Thêm useEffect
import { updateKitTemplate } from "@/services/kitTemplateServices"
import { useUploadImage } from "@/hooks/useUploadImage" // 👈 Import hook upload ảnh
import { useToast } from "@/components/ui/use-toast" // 👈 Import useToast

interface KitTemplateData {
    kitTemplateId: string
    kitTemplateName: string
    kitTemplateQuantity: number
    kitTemplateDescription: string
    kitTemplateUrlImg: string
    kitTemplateStatus: string
}

interface EditKitTemplateProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kitTemplate: KitTemplateData // Dùng interface đã định nghĩa
    onSuccess: () => void
}

export default function EditKitTemplate({ open, onOpenChange, kitTemplate, onSuccess }: EditKitTemplateProps) {
    const [formData, setFormData] = useState({
        kitTemplateName: kitTemplate.kitTemplateName,
        kitTemplateQuantity: kitTemplate.kitTemplateQuantity,
        kitTemplateDescription: kitTemplate.kitTemplateDescription,
        kitTemplateUrlImg: kitTemplate.kitTemplateUrlImg,
        kitTemplateStatus: kitTemplate.kitTemplateStatus
    })

    // States mới cho upload ảnh
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewImage, setPreviewImage] = useState<string>(kitTemplate.kitTemplateUrlImg) // URL ảnh đang hiển thị

    const [loading, setLoading] = useState(false)
    const { uploadImage, loading: isImageUploading, error: uploadError } = useUploadImage()
    const { toast } = useToast()

    const isProcessing = loading || isImageUploading

    // Đồng bộ state khi prop kitTemplate thay đổi
    useEffect(() => {
        setFormData({
            kitTemplateName: kitTemplate.kitTemplateName,
            kitTemplateQuantity: kitTemplate.kitTemplateQuantity,
            kitTemplateDescription: kitTemplate.kitTemplateDescription,
            kitTemplateUrlImg: kitTemplate.kitTemplateUrlImg,
            kitTemplateStatus: kitTemplate.kitTemplateStatus
        })
        setPreviewImage(kitTemplate.kitTemplateUrlImg)
        setImageFile(null) // Reset file ảnh mới
    }, [kitTemplate])

    // Xử lý thay đổi cho các input text/number/textarea
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        // Chuyển Quantity về số nếu là input quantity
        const finalValue = name === "kitTemplateQuantity" ? Number(value) : value
        setFormData((prev) => ({ ...prev, [name]: finalValue }))
    }

    // Xử lý chọn file ảnh
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setImageFile(null)
            setPreviewImage(kitTemplate.kitTemplateUrlImg) // Quay lại URL ảnh gốc nếu không có file mới
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isProcessing) {
            toast({ title: "Wait", description: "Operation is in progress. Please wait.", variant: "default" });
            return;
        }

        setLoading(true)
        let finalImageUrl = formData.kitTemplateUrlImg // Mặc định là URL cũ

        try {
            // BƯỚC 1: XỬ LÝ UPLOAD ẢNH MỚI
            if (imageFile) {
                // Upload ảnh và nhận lại URL
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
                kitTemplateUrlImg: finalImageUrl, // Sử dụng URL ảnh mới (hoặc cũ)
            }

            await updateKitTemplate(kitTemplate.kitTemplateId, dataToUpdate)

            onSuccess()
            onOpenChange(false)

        } catch (error: any) {
            console.error("Failed to update kit template:", error)
            const errorMessage = uploadError || error.message || "Failed to update kit template. Please try again."
            toast({
                title: "Error",
                description: errorMessage,
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
                    <DialogTitle>Edit Kit Template</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="kitTemplateName">Name</Label>
                        <Input
                            id="kitTemplateName"
                            name="kitTemplateName"
                            value={formData.kitTemplateName}
                            onChange={handleChange}
                            required
                            disabled={isProcessing}
                        />
                    </div>
                    {/* Quantity */}
                    <div>
                        <Label htmlFor="kitTemplateQuantity">Quantity</Label>
                        <Input
                            id="kitTemplateQuantity"
                            name="kitTemplateQuantity"
                            type="number"
                            min="0"
                            value={formData.kitTemplateQuantity}
                            onChange={handleChange}
                            required
                            disabled={isProcessing}
                        />
                    </div>
                    {/* Description */}
                    <div>
                        <Label htmlFor="kitTemplateDescription">Description</Label>
                        <Input // Hoặc Textarea nếu description dài hơn
                            id="kitTemplateDescription"
                            name="kitTemplateDescription"
                            value={formData.kitTemplateDescription}
                            onChange={handleChange}
                            disabled={isProcessing}
                        />
                    </div>
                    {/* Image Upload và Preview */}
                    <div>
                        <Label htmlFor="kitTemplateUrlImg">Image Upload</Label>
                        <Input
                            id="kitTemplateUrlImg"
                            type="file" // 👈 Thay thế input URL bằng File
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isProcessing}
                            className="cursor-pointer"
                        />
                        {(previewImage) && (
                            <div className="mt-2">
                                <img
                                    src={previewImage}
                                    alt="Template preview"
                                    className="h-32 w-auto object-cover rounded border"
                                />
                            </div>
                        )}
                    </div>
                    {/* Status */}
                    <div>
                        <Label htmlFor="kitTemplateStatus">Status</Label>
                        <Select
                            name="kitTemplateStatus"
                            value={formData.kitTemplateStatus}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, kitTemplateStatus: value }))}
                            disabled={isProcessing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Valid">Valid</SelectItem>
                                <SelectItem value="Invalid">Invalid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? "Updating..." : "Update"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}