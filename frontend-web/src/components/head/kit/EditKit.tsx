"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { updateKit } from "@/services/kitServices"
import { useUploadImage } from "@/hooks/useUploadImage"
import { useToast } from "@/components/ui/use-toast"

interface EditKitProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    kit: {
        kitId: string
        kitTemplateId: string
        kitTemplateName: string
        kitName: string
        kitDescription: string
        kitUrlImg: string
        kitUrlQr: string
        kitCreateDate: string
        kitStatus: string
    }
    onSuccess: () => void
}

interface KitFormData {
    kitTemplateId: string
    kitName: string
    kitDescription: string
    kitUrlImg: string
    kitUrlQr: string
    kitCreateDate: string
    kitStatus: string
}

export default function EditKit({ open, onOpenChange, kit, onSuccess }: EditKitProps) {
    const [formData, setFormData] = useState<KitFormData>({
        kitTemplateId: kit.kitTemplateId ?? "",
        kitName: kit.kitName ?? "",
        kitDescription: kit.kitDescription ?? "",
        kitUrlImg: kit.kitUrlImg ?? "",
        kitUrlQr: kit.kitUrlQr ?? "",
        kitCreateDate: kit.kitCreateDate ?? "",
        kitStatus: kit.kitStatus ?? "",
    })

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewImage, setPreviewImage] = useState<string>(kit.kitUrlImg ?? "")
    const [isLoading, setIsLoading] = useState(false)
    const { uploadImage, loading: isImageUploading, error: uploadError } = useUploadImage()
    const { toast } = useToast()

    const isProcessing = isLoading || isImageUploading

    useEffect(() => {
        setFormData({
            kitTemplateId: kit.kitTemplateId ?? "",
            kitName: kit.kitName ?? "",
            kitDescription: kit.kitDescription ?? "",
            kitUrlImg: kit.kitUrlImg ?? "",
            kitUrlQr: kit.kitUrlQr ?? "",
            kitCreateDate: kit.kitCreateDate ?? "",
            kitStatus: kit.kitStatus ?? "",
        })
        setPreviewImage(kit.kitUrlImg ?? "")
        setImageFile(null)
    }, [kit])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setImageFile(null)
            setPreviewImage(kit.kitUrlImg ?? "")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isProcessing) {
            toast({ title: "Wait", description: "Operation is in progress. Please wait.", variant: "default" });
            return;
        }

        setIsLoading(true)
        let finalImageUrl = formData.kitUrlImg

        try {
            if (imageFile) {
                finalImageUrl = await new Promise<string>((resolve, reject) => {
                    uploadImage({
                        file: imageFile,
                        onSuccess: resolve,
                        onError: (errorMsg) => reject(new Error(errorMsg)),
                    })
                })
            }

            const dataToUpdate = {
                ...formData,
                kitUrlImg: finalImageUrl,
            }

            await updateKit(kit.kitId, dataToUpdate)
            onSuccess()
            onOpenChange(false)

        } catch (error: any) {
            console.error("Failed to update kit:", error)
            const errorMessage = uploadError || error.message || "Failed to update kit. Please try again."
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {formData.kitName || "Kit"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="kitName">Kit Name</Label>
                        <Input
                            id="kitName"
                            value={formData.kitName}
                            onChange={(e) => setFormData({ ...formData, kitName: e.target.value })}
                            required
                            disabled={isProcessing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="kitDescription">Description</Label>
                        <Input
                            id="kitDescription"
                            value={formData.kitDescription}
                            onChange={(e) => setFormData({ ...formData, kitDescription: e.target.value })}
                            disabled={isProcessing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="kitUrlImg">Kit Image</Label>
                        <Input
                            id="kitUrlImg"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isProcessing}
                            className="cursor-pointer"
                        />
                        {previewImage && (
                            <div className="mt-2">
                                <img
                                    src={previewImage}
                                    alt="Kit preview"
                                    className="h-32 w-auto object-cover rounded border"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="kitUrlQr">QR Code URL</Label>
                        <Input
                            id="kitUrlQr"
                            value={formData.kitUrlQr}
                            onChange={(e) => setFormData({ ...formData, kitUrlQr: e.target.value })}
                            disabled={isProcessing}
                        />
                    </div>

                    <div>
                        <Label htmlFor="kitStatus">Status</Label>
                        <Select
                            value={formData.kitStatus || undefined}
                            onValueChange={(value) => setFormData({ ...formData, kitStatus: value })}
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? "Updating..." : "Update Kit"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}