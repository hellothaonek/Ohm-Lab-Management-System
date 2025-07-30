"use client"

import { useState } from "react"
import { X, Calendar, User, Package, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CreateCheckoutProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (checkout: any) => void
}

export default function CreateCheckout({ isOpen, onClose, onSuccess }: CreateCheckoutProps) {
    const [formData, setFormData] = useState({
        equipmentName: "",
        equipmentCode: "",
        borrowerName: "",
        borrowerId: "",
        groupName: "",
        checkoutDate: "",
        expectedReturnDate: "",
        notes: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newCheckout = {
                id: Date.now().toString(),
                ...formData,
                status: "InUse" as const,
                actualReturnDate: undefined
            }

            onSuccess(newCheckout)
            handleClose()
            resetForm()
        } catch (error) {
            console.error("Error creating checkout:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            onClose()
            resetForm()
        }
    }

    const resetForm = () => {
        setFormData({
            equipmentName: "",
            equipmentCode: "",
            borrowerName: "",
            borrowerId: "",
            groupName: "",
            checkoutDate: "",
            expectedReturnDate: "",
            notes: ""
        })
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Tạo checkout mới
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Equipment Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Thông tin thiết bị
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="equipmentName">Tên thiết bị *</Label>
                                <Input
                                    id="equipmentName"
                                    value={formData.equipmentName}
                                    onChange={(e) => handleInputChange("equipmentName", e.target.value)}
                                    placeholder="Nhập tên thiết bị"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="equipmentCode">Mã thiết bị *</Label>
                                <Input
                                    id="equipmentCode"
                                    value={formData.equipmentCode}
                                    onChange={(e) => handleInputChange("equipmentCode", e.target.value)}
                                    placeholder="Nhập mã thiết bị"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Borrower Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Thông tin người mượn
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="borrowerName">Tên người mượn *</Label>
                                <Input
                                    id="borrowerName"
                                    value={formData.borrowerName}
                                    onChange={(e) => handleInputChange("borrowerName", e.target.value)}
                                    placeholder="Nhập tên người mượn"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="borrowerId">Mã người mượn *</Label>
                                <Input
                                    id="borrowerId"
                                    value={formData.borrowerId}
                                    onChange={(e) => handleInputChange("borrowerId", e.target.value)}
                                    placeholder="Nhập mã người mượn"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="groupName">Nhóm</Label>
                            <Input
                                id="groupName"
                                value={formData.groupName}
                                onChange={(e) => handleInputChange("groupName", e.target.value)}
                                placeholder="Nhập tên nhóm (nếu có)"
                            />
                        </div>
                    </div>

                    {/* Date Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Thông tin thời gian
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="checkoutDate">Ngày giao *</Label>
                                <Input
                                    id="checkoutDate"
                                    type="date"
                                    value={formData.checkoutDate}
                                    onChange={(e) => handleInputChange("checkoutDate", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expectedReturnDate">Ngày trả dự kiến *</Label>
                                <Input
                                    id="expectedReturnDate"
                                    type="date"
                                    value={formData.expectedReturnDate}
                                    onChange={(e) => handleInputChange("expectedReturnDate", e.target.value)}
                                    min={formData.checkoutDate}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Nhập ghi chú về việc mượn thiết bị..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Đang tạo..." : "Tạo checkout"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 