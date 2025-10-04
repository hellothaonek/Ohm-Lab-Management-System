"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronDown, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { createKitTemplate } from "@/services/kitTemplateServices"
import { useToast } from "@/components/ui/use-toast"
import { useUploadImage } from "@/hooks/useUploadImage"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { searchAccessory } from "@/services/accessoryServices"

// --- INTERFACE MỚI ---
interface Accessory {
    accessoryId: number
    accessoryName: string
    accessoryValueCode: string
}

interface RequiredAccessory {
    accessoryId: number
    accessoryQuantity: number
}

interface CreateKitTemplateProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

// --- Component Phụ: AccessoryDetailItem (Phương án 1: Chi tiết kèm Input) ---

interface AccessoryDetailItemProps {
    name: string
    quantity: number
    onQuantityChange: (newQuantity: number) => void
    onRemove: () => void
    disabled: boolean
}

const AccessoryDetailItem: React.FC<AccessoryDetailItemProps> = ({ name, quantity, onQuantityChange, onRemove, disabled }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        if (!isNaN(value) && value >= 1) {
            onQuantityChange(value)
        } else if (e.target.value === "") {
            // Cho phép ô trống tạm thời khi người dùng đang nhập
            onQuantityChange(1)
        } else if (value < 1) {
            onQuantityChange(1) // Đặt lại về 1 nếu nhập số âm/0
        }
    }

    return (
        <div className="flex items-center gap-2 border-b last:border-b-0 py-2">
            <div className="flex-1 truncate">
                <span>{name}</span>
            </div>
            <div className="flex items-center gap-2">
                <Label htmlFor={`qty-${name}`} className="text-right sr-only">Quantity:</Label>
                <Input
                    id={`qty-${name}`}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleChange}
                    onBlur={() => {
                        if (quantity < 1) onQuantityChange(1)
                    }}
                    className="w-16 h-8 text-center"
                    disabled={disabled}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                    onClick={onRemove}
                    disabled={disabled}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

// --- Component Chính: CreateKitTemplate ---

export default function CreateKitTemplate({ open, onOpenChange, onSuccess }: CreateKitTemplateProps) {
    const [kitTemplateName, setKitTemplateName] = useState("")
    const [kitTemplateDescription, setKitTemplateDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    // Cập nhật State cho Phụ kiện
    const [requiredAccessories, setRequiredAccessories] = useState<RequiredAccessory[]>([])
    const [allAccessories, setAllAccessories] = useState<Accessory[]>([])
    const [isLoadingAccessories, setIsLoadingAccessories] = useState(false)
    const [accessorySelectorOpen, setAccessorySelectorOpen] = useState(false)

    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const { uploadImage, loading: isImageUploading, error: uploadError } = useUploadImage()

    const isProcessing = loading || isImageUploading || isLoadingAccessories

    useEffect(() => {
        const fetchAccessories = async () => {
            setIsLoadingAccessories(true)
            try {
                const response = await searchAccessory({ pageNum: 1, pageSize: 100, keyWord: "", status: "" })
                setAllAccessories(response.pageData.map((item: any) => ({
                    accessoryId: item.accessoryId,
                    accessoryName: item.accessoryName,
                    accessoryValueCode: item.accessoryValueCode,
                })))
            } catch (err) {
                console.error("Failed to load accessories:", err)
                toast({
                    title: "Error",
                    description: "Failed to load accessories list.",
                    variant: "destructive"
                })
            } finally {
                setIsLoadingAccessories(false)
            }
        }
        if (open) {
            fetchAccessories()
        }
    }, [open, toast])

    // --- LOGIC QUẢN LÝ ACCESSORIES ---

    // 1. Thêm/Xóa Accessory khỏi danh sách yêu cầu
    const handleAccessoryChange = (accessoryId: number, checked: boolean) => {
        setRequiredAccessories((prev) => {
            const currentItems = prev
            if (checked) {
                // Thêm mới với số lượng mặc định là 1
                const newItem: RequiredAccessory = { accessoryId: accessoryId, accessoryQuantity: 1 }
                return [...currentItems, newItem]
            } else {
                // Xóa item
                return currentItems.filter((item) => item.accessoryId !== accessoryId)
            }
        })
    }

    // 2. Cập nhật số lượng
    const updateAccessoryQuantity = (accessoryId: number, newQuantity: number) => {
        setRequiredAccessories((prev) => prev.map((item) =>
            item.accessoryId === accessoryId ? { ...item, accessoryQuantity: newQuantity } : item
        ))
    }

    // 3. Xóa item (dùng trong AccessoryDetailItem)
    const removeAccessory = (accessoryId: number) => {
        setRequiredAccessories((prev) => prev.filter((item) => item.accessoryId !== accessoryId))
    }

    // --- CÁC LOGIC KHÁC GIỮ NGUYÊN HOẶC ĐƠN GIẢN HÓA ---

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setPreviewImage(URL.createObjectURL(file))
        } else {
            setImageFile(null)
            setPreviewImage(null)
        }
    }

    // Bỏ hàm handleAddAccessory cũ

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isImageUploading) {
            toast({ title: "Wait", description: "Image is still uploading. Please wait.", variant: "default" });
            return;
        }

        // Kiểm tra số lượng phụ kiện phải >= 1
        if (requiredAccessories.some(item => item.accessoryQuantity < 1)) {
            toast({
                title: "Validation Error",
                description: "Quantity for all accessories must be at least 1.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true)
        let finalImageUrl = ""

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

            await createKitTemplate({
                kitTemplateName,
                kitTemplateDescription,
                kitTemplateUrlImg: finalImageUrl,
                listAccessory: requiredAccessories // SỬ DỤNG requiredAccessories MỚI
            })

            // Reset States
            setKitTemplateName("")
            setKitTemplateDescription("")
            setImageFile(null)
            setPreviewImage(null)
            setRequiredAccessories([])

            onOpenChange(false)
            onSuccess()
            toast({
                title: "Success",
                description: "Kit Template created successfully.",
            })
        } catch (error: any) {
            console.error("Failed to create kit template:", error)
            const errorMessage = uploadError || error.message || "Failed to create kit template."
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Kit Template</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new kit template.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">

                        {/* Tên và Mô tả */}
                        <div className="grid gap-2">
                            <Label htmlFor="kitTemplateName">Name</Label>
                            <Input
                                id="kitTemplateName"
                                value={kitTemplateName}
                                onChange={(e) => setKitTemplateName(e.target.value)}
                                placeholder="Enter kit template name"
                                required
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="kitTemplateDescription">Description</Label>
                            <Textarea
                                id="kitTemplateDescription"
                                value={kitTemplateDescription}
                                onChange={(e) => setKitTemplateDescription(e.target.value)}
                                placeholder="Enter kit template description"
                                disabled={isProcessing}
                            />
                        </div>

                        {/* Upload Ảnh */}
                        <div className="grid gap-2">
                            <Label htmlFor="kitTemplateImage">Image Upload</Label>
                            <Input
                                id="kitTemplateImage"
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
                                        alt="Template preview"
                                        className="h-32 w-auto object-cover rounded border"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Required Accessories</Label>
                            <Popover open={accessorySelectorOpen} onOpenChange={setAccessorySelectorOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={accessorySelectorOpen}
                                        className="w-full justify-between min-h-10 bg-transparent"
                                        disabled={isProcessing}
                                    >
                                        {requiredAccessories.length === 0
                                            ? "Select accessories..."
                                            : `${requiredAccessories.length} accessory${requiredAccessories.length > 1 ? "s" : ""} selected`}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search accessories..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                {isLoadingAccessories ? "Loading accessories..." : "No accessories found."}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {allAccessories.map((accessory) => {
                                                    const isSelected = requiredAccessories.some(item => item.accessoryId === accessory.accessoryId)
                                                    return (
                                                        <CommandItem
                                                            key={accessory.accessoryId}
                                                            value={accessory.accessoryName} 
                                                            onSelect={() => handleAccessoryChange(accessory.accessoryId, !isSelected)}
                                                        >
                                                            <Check
                                                                className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                                                            />
                                                            {accessory.accessoryName} - {accessory.accessoryValueCode}
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {/* HIỂN THỊ DANH SÁCH CHI TIẾT KÈM INPUT SỐ LƯỢNG */}
                            {requiredAccessories.length > 0 && (
                                <div className="border rounded-md mt-2 p-2 max-h-48 overflow-y-auto">
                                    {requiredAccessories.map((item) => {
                                        const accessory = allAccessories.find(a => a.accessoryId === item.accessoryId)
                                        return (
                                            <AccessoryDetailItem
                                                key={item.accessoryId}
                                                name={accessory?.accessoryName || `ID: ${item.accessoryId}`}
                                                quantity={item.accessoryQuantity}
                                                onQuantityChange={(qty) => updateAccessoryQuantity(item.accessoryId, qty)}
                                                onRemove={() => removeAccessory(item.accessoryId)}
                                                disabled={isProcessing}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}