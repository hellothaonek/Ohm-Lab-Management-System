"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Calendar, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DashboardLayout from "@/components/dashboard-layout"
import { useClientOnly } from "@/hooks/useClientOnly"
import CreateCheckout from "@/components/lecturer/equipment-checkout/CreateCheckout"
import EditCheckout from "@/components/lecturer/equipment-checkout/EditCheckout"
import DeleteCheckout from "@/components/lecturer/equipment-checkout/DeleteCheckout"
import CheckoutDetail from "@/components/lecturer/equipment-checkout/CheckoutDetail"

// Mock data - replace with actual API calls
interface CheckoutItem {
    id: string
    equipmentName: string
    equipmentCode: string
    borrowerName: string
    borrowerId: string
    checkoutDate: string
    expectedReturnDate: string
    actualReturnDate?: string
    status: "InUse" | "Available" | "Maintenance" | "Damaged"
    notes?: string
    groupName?: string
}

const mockCheckoutData: CheckoutItem[] = [
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

const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "InUse", label: "Đang sử dụng" },
    { value: "Available", label: "Chưa sử dụng" },
    { value: "Maintenance", label: "Bảo trì" },
    { value: "Damaged", label: "Hư hại" },
]

export default function HeadEquipmentCheckoutPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [checkoutData, setCheckoutData] = useState<CheckoutItem[]>(mockCheckoutData)
    const [isLoading, setIsLoading] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedCheckoutId, setSelectedCheckoutId] = useState<string | null>(null)
    const hasMounted = useClientOnly()

    const filteredCheckoutData = useMemo(() => {
        return checkoutData.filter(item => {
            const matchesSearch = searchTerm === "" ||
                item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.groupName?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = selectedStatus === "all" || item.status === selectedStatus

            return matchesSearch && matchesStatus
        })
    }, [checkoutData, searchTerm, selectedStatus])

    const handleCreateSuccess = (newCheckout: CheckoutItem) => {
        setCheckoutData(prev => [newCheckout, ...prev])
    }

    const handleViewDetail = (checkoutId: string) => {
        setSelectedCheckoutId(checkoutId)
        setIsDetailModalOpen(true)
    }

    const handleCloseDetail = () => {
        setIsDetailModalOpen(false)
        setSelectedCheckoutId(null)
    }

    const handleEditCheckout = (checkoutId: string) => {
        setSelectedCheckoutId(checkoutId)
        setIsEditModalOpen(true)
    }

    const handleCloseEdit = () => {
        setIsEditModalOpen(false)
        setSelectedCheckoutId(null)
    }

    const handleEditSuccess = (updatedCheckout: CheckoutItem) => {
        setCheckoutData(prev => prev.map(item =>
            item.id === updatedCheckout.id ? updatedCheckout : item
        ))
    }

    const handleDeleteCheckout = (checkoutId: string) => {
        setSelectedCheckoutId(checkoutId)
        setIsDeleteModalOpen(true)
    }

    const handleCloseDelete = () => {
        setIsDeleteModalOpen(false)
        setSelectedCheckoutId(null)
    }

    const handleDeleteSuccess = (checkoutId: string) => {
        setCheckoutData(prev => prev.filter(item => item.id !== checkoutId))
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
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const renderTableView = () => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên thiết bị</TableHead>
                            <TableHead>Mã thiết bị</TableHead>
                            <TableHead>Người mượn</TableHead>
                            <TableHead>Nhóm</TableHead>
                            <TableHead>Ngày giao</TableHead>
                            <TableHead>Ngày trả dự kiến</TableHead>
                            <TableHead>Ngày trả thực tế</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4">
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : filteredCheckoutData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4">
                                    Không tìm thấy dữ liệu checkout
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCheckoutData.map((checkout) => (
                                <TableRow key={checkout.id}>
                                    <TableCell className="font-medium">
                                        <button
                                            onClick={() => handleViewDetail(checkout.id)}
                                            className="text-left hover:text-orange-600 hover:underline transition-colors"
                                        >
                                            {checkout.equipmentName}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-orange-500">{checkout.equipmentCode}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{checkout.borrowerName}</div>
                                            <div className="text-sm text-gray-500">{checkout.borrowerId}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{checkout.groupName || "-"}</TableCell>
                                    <TableCell>{formatDate(checkout.checkoutDate)}</TableCell>
                                    <TableCell>{formatDate(checkout.expectedReturnDate)}</TableCell>
                                    <TableCell>
                                        {checkout.actualReturnDate ? formatDate(checkout.actualReturnDate) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(checkout.status)} className="flex items-center gap-1 w-fit">
                                            {getStatusIcon(checkout.status)}
                                            {getStatusLabel(checkout.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleViewDetail(checkout.id)}
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEditCheckout(checkout.id)}
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteCheckout(checkout.id)}
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )

    if (!hasMounted) {
        return (
            <DashboardLayout role="head">
                <div className="min-h-screen p-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg">Đang tải...</div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="head">
            <div className="min-h-screen p-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Checkout/Checkin Thiết bị</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Theo dõi việc mượn trả thiết bị của các nhóm trong khoa
                            </p>
                        </div>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo checkout mới
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số checkout</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {checkoutData.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Đang sử dụng</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {checkoutData.filter((c) => c.status === "InUse").length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Đã trả</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {checkoutData.filter((c) => c.status === "Available").length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Cần bảo trì</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {checkoutData.filter((c) => c.status === "Maintenance").length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm theo tên thiết bị, mã thiết bị, người mượn, nhóm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Results */}
                <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Hiển thị {filteredCheckoutData.length} trong tổng số {checkoutData.length} checkout
                    </p>
                </div>

                {/* Checkout Display */}
                {filteredCheckoutData.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Không tìm thấy dữ liệu checkout
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Thử điều chỉnh tiêu chí tìm kiếm hoặc tạo checkout mới.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    renderTableView()
                )}

                {/* Create Checkout Modal */}
                <CreateCheckout
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />

                {/* Checkout Detail Modal */}
                <CheckoutDetail
                    checkoutId={selectedCheckoutId}
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetail}
                    onEdit={handleEditCheckout}
                    onDelete={handleDeleteCheckout}
                />

                {/* Edit Checkout Modal */}
                <EditCheckout
                    checkoutId={selectedCheckoutId}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEdit}
                    onSuccess={handleEditSuccess}
                />

                {/* Delete Checkout Modal */}
                <DeleteCheckout
                    checkoutId={selectedCheckoutId}
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDelete}
                    onSuccess={handleDeleteSuccess}
                />
            </div>
        </DashboardLayout>
    )
} 