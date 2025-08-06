"use client"

import { useState, useEffect } from "react"
import { Calendar, User, Package, CheckCircle, XCircle, Clock, AlertTriangle, Edit, Trash2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CheckoutDetailProps {
    checkoutId: string | null
    isOpen: boolean
    onClose: () => void
    onEdit: (checkoutId: string) => void
    onDelete: (checkoutId: string) => void
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

export default function CheckoutDetail({ checkoutId, isOpen, onClose, onEdit, onDelete }: CheckoutDetailProps) {
    const [checkout, setCheckout] = useState<any>(null)
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

            const foundCheckout = mockCheckoutData.find(item => item.id === checkoutId)
            setCheckout(foundCheckout || null)
        } catch (error) {
            console.error("Error loading checkout data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        onClose()
        setCheckout(null)
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (!checkout && !isLoading) {
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Chi tiết checkout
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => checkout && onEdit(checkout.id)}
                                title="Chỉnh sửa"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => checkout && onDelete(checkout.id)}
                                title="Xóa"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleClose}
                                title="Đóng"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg">Đang tải dữ liệu...</div>
                    </div>
                ) : checkout ? (
                    <div className="space-y-6">
                        {/* Equipment Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Thông tin thiết bị
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tên thiết bị</label>
                                    <p className="text-lg font-semibold">{checkout.equipmentName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mã thiết bị</label>
                                    <p className="text-lg font-semibold text-orange-600">{checkout.equipmentCode}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Borrower Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Thông tin người mượn
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tên người mượn</label>
                                    <p className="text-lg font-semibold">{checkout.borrowerName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Mã người mượn</label>
                                    <p className="text-lg font-semibold">{checkout.borrowerId}</p>
                                </div>
                            </div>

                            {checkout.groupName && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nhóm</label>
                                    <p className="text-lg font-semibold">{checkout.groupName}</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Date Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Thông tin thời gian
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ngày giao</label>
                                    <p className="text-lg font-semibold">{formatDate(checkout.checkoutDate)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ngày trả dự kiến</label>
                                    <p className="text-lg font-semibold">{formatDate(checkout.expectedReturnDate)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ngày trả thực tế</label>
                                    <p className="text-lg font-semibold">
                                        {checkout.actualReturnDate ? formatDate(checkout.actualReturnDate) : "Chưa trả"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Status */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Trạng thái</h3>

                            <div className="flex items-center gap-3">
                                <Badge variant={getStatusVariant(checkout.status)} className="flex items-center gap-1 px-3 py-1">
                                    {getStatusIcon(checkout.status)}
                                    {getStatusLabel(checkout.status)}
                                </Badge>
                            </div>
                        </div>

                        {/* Notes */}
                        {checkout.notes && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Ghi chú</h3>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="text-gray-700 dark:text-gray-300">{checkout.notes}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                            >
                                Đóng
                            </Button>
                            <Button
                                className="bg-orange-500 hover:bg-orange-600"
                                onClick={() => onEdit(checkout.id)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">Không tìm thấy thông tin checkout</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
} 