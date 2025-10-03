"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateAccessory } from "@/services/accessoryServices"
import { useUploadImage } from "@/hooks/useUploadImage"
import { useToast } from "@/components/ui/use-toast"

interface EditAccessoryProps {
    open: boolean
    onClose: () => void
    onEdit: () => void
    accessory: {
        accessoryId: number
        accessoryName: string
        accessoryDescription: string
        accessoryUrlImg: string
        accessoryValueCode: string
        accessoryCase: string
        accessoryStatus: string
    }
}

export default function EditAccessory({ open, onClose, onEdit, accessory }: EditAccessoryProps) {
    const [accessoryName, setAccessoryName] = useState(accessory.accessoryName)
    const [accessoryDescription, setAccessoryDescription] = useState(accessory.accessoryDescription)
    const [accessoryValueCode, setAccessoryValueCode] = useState(accessory.accessoryValueCode)
    const [accessoryCase, setAccessoryCase] = useState(accessory.accessoryCase)
    const [accessoryStatus, setAccessoryStatus] = useState(accessory.accessoryStatus)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(accessory.accessoryUrlImg)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { uploadImage, loading: isImageUploading, error: uploadError } = useUploadImage()
    const { toast } = useToast()

    const isProcessing = isLoading || isImageUploading

    useEffect(() => {
        setAccessoryName(accessory.accessoryName)
        setAccessoryDescription(accessory.accessoryDescription)
        setAccessoryValueCode(accessory.accessoryValueCode)
        setAccessoryCase(accessory.accessoryCase)
        setAccessoryStatus(accessory.accessoryStatus)
        setPreviewImage(accessory.accessoryUrlImg)
        setImageFile(null)
        setError(null)
    }, [accessory])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setImageFile(null)
            setPreviewImage(accessory.accessoryUrlImg)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isProcessing) {
            toast({ title: "Wait", description: "Operation is in progress. Please wait.", variant: "default" })
            return
        }

        setIsLoading(true)
        setError(null)
        let finalImageUrl = accessory.accessoryUrlImg

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

            await updateAccessory(accessory.accessoryId.toString(), {
                accessoryName,
                accessoryDescription,
                accessoryUrlImg: finalImageUrl,
                accessoryValueCode,
                accessoryCase,
                accessoryStatus,
            })

            onEdit()
            onClose()
        } catch (err: any) {
            const errorMessage = uploadError || err.response?.data?.message || err.message || "Failed to update accessory"
            setError(errorMessage)
            console.error("Error updating accessory:", err)
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Accessory</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Name */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="accessoryName">Name</Label>
                            <Input
                                id="accessoryName"
                                value={accessoryName}
                                onChange={(e) => setAccessoryName(e.target.value)}
                                required
                                disabled={isProcessing}
                            />
                        </div>
                        {/* Code */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="accessoryValueCode">Code</Label>
                            <Input
                                id="accessoryValueCode"
                                value={accessoryValueCode}
                                onChange={(e) => setAccessoryValueCode(e.target.value)}
                                required
                                disabled={isProcessing}
                            />
                        </div>
                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="accessoryDescription">Description</Label>
                            <Textarea
                                id="accessoryDescription"
                                value={accessoryDescription}
                                onChange={(e) => setAccessoryDescription(e.target.value)}
                                disabled={isProcessing}
                            />
                        </div>
                        {/* Image Upload and Preview */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="accessoryImage">Image</Label>
                            <Input
                                id="accessoryImage"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isProcessing}
                            />
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="Accessory preview"
                                    className="h-24 w-auto object-contain rounded border mt-2"
                                />
                            )}
                        </div>
                        {/* Case */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="accessoryCase">Case</Label>
                            <Input
                                id="accessoryCase"
                                value={accessoryCase}
                                onChange={(e) => setAccessoryCase(e.target.value)}
                                disabled={isProcessing}
                            />
                        </div>
                        {/* Status */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="accessoryStatus">Status</Label>
                            <Select value={accessoryStatus} onValueChange={setAccessoryStatus} disabled={isProcessing}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Valid">Valid</SelectItem>
                                    <SelectItem value="Invalid">Invalid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {error && (
                            <div className="text-center text-red-500">
                                {error}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}