"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { getEquipmentById, updateEquipment } from "@/services/equipmentServices";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Đảm bảo đường dẫn đúng
import { useUploadImage } from "@/hooks/useUploadImage"; // 👈 Import hook upload

interface Equipment {
    equipmentId: number;
    equipmentName: string;
    equipmentCode: string;
    equipmentNumberSerial: string;
    equipmentDescription: string;
    equipmentTypeUrlImg: string; // URL ảnh của loại thiết bị
    equipmentStatus: string;
}

interface EditEquipmentProps {
    open: boolean;
    onClose: () => void;
    onEdit: () => void;
    equipmentId: string;
}

export default function EditEquipment({ open, onClose, onEdit, equipmentId }: EditEquipmentProps) {
    const [formData, setFormData] = useState<Equipment>({
        equipmentId: 0,
        equipmentName: "",
        equipmentCode: "",
        equipmentNumberSerial: "",
        equipmentDescription: "",
        equipmentTypeUrlImg: "", // URL ảnh hiện tại
        equipmentStatus: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null) // File mới được chọn
    const [previewImage, setPreviewImage] = useState<string | null>(null) // URL preview

    // Sử dụng Hook Upload
    const { uploadImage, loading: isImageUploading, error: uploadError } = useUploadImage()

    const { toast } = useToast();

    const statusOptions = [
        { value: "Available", label: "Available" },
        { value: "InUse", label: "In Use" },
        { value: "Maintenance", label: "Maintenance" },
        { value: "Damaged", label: "Damaged" }, // Dùng "Damaged" thay vì "out-of-order" để thống nhất
    ];

    // Trạng thái xử lý tổng thể
    const isProcessing = isLoading || isImageUploading;

    useEffect(() => {
        if (open && equipmentId) {
            const fetchEquipmentData = async () => {
                setIsLoading(true);
                try {
                    const data = await getEquipmentById(equipmentId);

                    // Cập nhật formData
                    setFormData({
                        equipmentId: data.equipmentId,
                        equipmentName: data.equipmentName,
                        equipmentCode: data.equipmentCode,
                        equipmentNumberSerial: data.equipmentNumberSerial,
                        equipmentDescription: data.equipmentDescription || "",
                        equipmentTypeUrlImg: data.equipmentTypeUrlImg || "",
                        equipmentStatus: data.equipmentStatus,
                    });

                    // Cập nhật previewImage
                    setPreviewImage(data.equipmentTypeUrlImg || null);

                } catch (error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to fetch equipment details",
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchEquipmentData();
        }
    }, [open, equipmentId, toast]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setImageFile(null)
            // Nếu người dùng xóa file, revert về URL cũ trong formData
            setPreviewImage(formData.equipmentTypeUrlImg || null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isImageUploading) {
            toast({ title: "Wait", description: "Image is still uploading. Please wait.", variant: "default" });
            return;
        }

        setIsLoading(true);
        let finalImageUrl = formData.equipmentTypeUrlImg; // Bắt đầu bằng URL hiện tại

        try {
            // BƯỚC 1: XỬ LÝ UPLOAD ẢNH MỚI
            if (imageFile) {
                // Upload ảnh và đợi kết quả
                finalImageUrl = await new Promise<string>((resolve, reject) => {
                    uploadImage({
                        file: imageFile,
                        onSuccess: resolve,
                        onError: (errorMsg) => reject(new Error(errorMsg)),
                    });
                });
            }

            const dataToUpdate = {
                ...formData,
                equipmentTypeUrlImg: finalImageUrl, // Gán URL cuối cùng (mới hoặc cũ)
            }

            const { equipmentId: _, ...updateData } = dataToUpdate;

            await updateEquipment(equipmentId, updateData);

            onEdit();
            onClose();

        } catch (error: any) {
            console.error("Error updating equipment:", error);
            const errorMessage = uploadError || error.message || "Failed to update equipment";
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({ ...prev, equipmentStatus: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Equipment: {formData.equipmentName}</DialogTitle>
                </DialogHeader>
                {isLoading && !imageFile ? ( // Chỉ hiện loading nếu chưa có data (lần đầu fetch)
                    <div className="text-center p-8">Loading equipment details...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Input Name */}
                        <div>
                            <Label htmlFor="equipmentName">Equipment Name</Label>
                            <Input
                                id="equipmentName"
                                name="equipmentName"
                                value={formData.equipmentName}
                                onChange={handleInputChange}
                                required
                                disabled={isProcessing}
                            />
                        </div>
                        {/* Input Code */}
                        <div>
                            <Label htmlFor="equipmentCode">Equipment Code</Label>
                            <Input
                                id="equipmentCode"
                                name="equipmentCode"
                                value={formData.equipmentCode}
                                onChange={handleInputChange}
                                required
                                disabled={isProcessing}
                            />
                        </div>
                        {/* Input Serial Number */}
                        <div>
                            <Label htmlFor="equipmentNumberSerial">Serial Number</Label>
                            <Input
                                id="equipmentNumberSerial"
                                name="equipmentNumberSerial"
                                value={formData.equipmentNumberSerial}
                                onChange={handleInputChange}
                                required
                                disabled={isProcessing}
                            />
                        </div>
                        {/* Input Description */}
                        <div>
                            <Label htmlFor="equipmentDescription">Description</Label>
                            <Textarea
                                id="equipmentDescription"
                                name="equipmentDescription"
                                value={formData.equipmentDescription}
                                onChange={handleInputChange}
                                placeholder="Enter equipment description"
                                disabled={isProcessing}
                            />
                        </div>

                        {/* INPUT FILE VÀ PREVIEW MỚI */}
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

                        {/* Select Status */}
                        <div>
                            <Label htmlFor="equipmentStatus">Status</Label>
                            <Select
                                value={formData.equipmentStatus}
                                onValueChange={handleStatusChange}
                                disabled={isProcessing}
                            >
                                <SelectTrigger id="equipmentStatus">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isProcessing}>
                                {isProcessing ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}