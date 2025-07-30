"use client"

import { useState, useEffect } from "react"
import { Calendar, User, Package, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface EditCheckoutProps {
    checkoutId: string | null
    isOpen: boolean
    onClose: () => void
    onSuccess: (checkout: any) => void
}

// Mock data - replace with actual API call
const mockCheckoutData = [
    {
        id: "1",
        equipmentName: "Microscope X100",
        equipmentCode: "MIC001",
        borrowerName: "Nguyễn Văn A",
        borrowerId: "SV001",
        checkoutDate: "2024-01-15",
        expectedReturnDate: "2024-01-20",
        status: "InUse",
        notes: "Sử dụng cho thí nghiệm sinh học",
        groupName: "Nhóm 1 - Sinh học"
    },
    {
        id: "2",
        equipmentName: "Laptop Dell XPS",
        equipmentCode: "LAP002",
        borrowerName: "Trần Thị B",
        borrowerId: "SV002",
        checkoutDate: "2024-01-10",
        expectedReturnDate: "2024-01-25",
        actualReturnDate: "2024-01-22",
        status: "Available",
        notes: "Đã trả đúng hạn",
        groupName: "Nhóm 2 - Tin học"
    },
    {
        id: "3",
        equipmentName: "Oscilloscope",
        equipmentCode: "OSC003",
        borrowerName: "Lê Văn C",
        borrowerId: "SV003",
        checkoutDate: "2024-01-05",
        expectedReturnDate: "2024-01-15",
        status: "Maintenance",
        notes: "Cần bảo trì định kỳ",
        groupName: "Nhóm 3 - Điện tử"
    },
    {
        id: "4",
        equipmentName: "Multimeter",
        equipmentCode: "MUL004",
        borrowerName: "Phạm Thị D",
        borrowerId: "SV004",
        checkoutDate: "2024-01-12",
        expectedReturnDate: "2024-01-18",
        status: "Damaged",
        notes: "Bị hỏng trong quá trình sử dụng",
        groupName: "Nhóm 4 - Điện"
    }
]

export default function EditCheckout({ checkoutId, isOpen, onClose, onSuccess }: EditCheckoutProps) {
    const [formData, setFormData] = useState({
        equipmentName: "",
        equipmentCode: "",
        borrowerName: "",
        borrowerId: "",
        groupName: "",
        checkoutDate: "",
        expectedReturnDate: "",
        actualReturnDate: "",
        status: "InUse" as "InUse" | "Available" | "Maintenance" | "Damaged",
        notes: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && checkoutId) {
            loadCheckoutData()
        }
    }, [isOpen, checkoutId])

    const loadCheckoutData = async () => {
        setIsLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500))

            const checkout = mockCheckoutData.find(item => item.id === checkoutId)
            if (checkout) {
                setFormData({
                    equipmentName: checkout.equipmentName,
                    equipmentCode: checkout.equipmentCode,
                    borrowerName: checkout.borrowerName,
                    borrowerId: checkout.borrowerId,
                    groupName: checkout.groupName || "",
                    checkoutDate: checkout.checkoutDate,
                    expectedReturnDate: checkout.expectedReturnDate,
                    actualReturnDate: checkout.actualReturnDate || "",
                    status: checkout.status,
                    notes: checkout.notes || ""
                })
            }
        } catch (error) {
            console.error("Error loading checkout data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const updatedCheckout = {
                id: checkoutId!,
                ...formData
            }

            onSuccess(updatedCheckout)
            handleClose()
        } catch (error) {
            console.error("Error updating checkout:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            onClose()
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Available":
                return "default"
            case "InUse":
                return "secondary"
            case "Maintenance":
                return "outline"
            case "Damaged":
                return "destructive"
            default:
                return "outline"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Available":
                return <CheckCircle className="h-4 w-4" />
            case "InUse":
                return <Clock className="h-4 w-4" />
            case "Maintenance":
                return <AlertTriangle className="h-4 w-4" />
            case "Damaged":
                return <XCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "Available":
                return "Chưa sử dụng"
            case "InUse":
                return "Đang sử dụng"
            case "Maintenance":
                return "Bảo trì"
            case "Damaged":
                return "Hư hại"
            default:
                return status
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Chỉnh sửa checkout
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg">Đang tải dữ liệu...</div>
                    </div>
                ) : (
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                                <div className="space-y-2">
                                    <Label htmlFor="actualReturnDate">Ngày trả thực tế</Label>
                                    <Input
                                        id="actualReturnDate"
                                        type="date"
                                        value={formData.actualReturnDate}
                                        onChange={(e) => handleInputChange("actualReturnDate", e.target.value)}
                                        min={formData.checkoutDate}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Trạng thái</h3>

                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái thiết bị *</Label>
                                <Select value={formData.status} onValueChange={(value: any) => handleInputChange("status", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="InUse">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Đang sử dụng
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Available">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Chưa sử dụng
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Maintenance">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Bảo trì
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Damaged">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4" />
                                                Hư hại
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Trạng thái hiện tại:</span>
                                <Badge variant={getStatusVariant(formData.status)} className="flex items-center gap-1">
                                    {getStatusIcon(formData.status)}
                                    {getStatusLabel(formData.status)}
                                </Badge>
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
                                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
} 