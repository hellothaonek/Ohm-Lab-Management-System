"use client"

import { useState, useEffect, useMemo } from "react" // Đã thêm lại useMemo
import { Search, Eye, EllipsisVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from 'antd'
import { searchEquipmentType } from "@/services/equipmentTypeServices"
import CreateEquipmentType from "./CreateEquipmentType"
import DeleteEquipmentType from "./DeleteEquipmentType"
import EditEquipmentType from "./EditEquipmentType"

interface EquipmentType {
    equipmentTypeId: string;
    equipmentTypeName: string;
    equipmentTypeCode: string;
    equipmentTypeQuantity: number;
    equipmentTypeStatus: string;
    equipmentTypeDescription?: string;
    equipmentTypeUrlImg: string;
    equipmentTypeCreateDate?: string;
}

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Available", label: "Available" },
    { value: "InUse", label: "In Use" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Damaged", label: "Damaged" },
]

export default function EquipmentTypeTab() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    // equipmentTypeItems giờ sẽ lưu dữ liệu được lọc status và phân trang từ server, 
    // sau đó sẽ được lọc tìm kiếm cục bộ (client-side)
    const [equipmentTypeItems, setEquipmentTypeItems] = useState<EquipmentType[]>([])
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalTypeItems, setTotalTypeItems] = useState(0)
    const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false)
    const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false)
    const [isDeleteTypeModalOpen, setIsDeleteTypeModalOpen] = useState(false)
    const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType | null>(null)
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const allowedStatuses = ["Available", "InUse", "Maintenance", "Damaged"]


    const fetchEquipmentTypes = async () => {
        setLoading(true)
        try {
            // KHÔNG TRUYỀN searchQuery/keyWord NỮA, chỉ gửi status và thông tin phân trang
            const status = selectedStatus === "all" ? "" : selectedStatus

            const response = await searchEquipmentType({
                pageNum,
                pageSize,
                keyWord: "",
                status: status
            })

            // Cập nhật state với dữ liệu ĐÃ lọc status và phân trang từ server
            setEquipmentTypeItems(response.pageData || [])
            setTotalTypeItems(response.pageInfo.totalItem)
            setPageNum(response.pageInfo.page)
            setPageSize(response.pageInfo.size)
        } catch (error) {
            console.error("Error fetching equipment types:", error)
            setEquipmentTypeItems([])
            setTotalTypeItems(0)
        } finally {
            setLoading(false)
        }
    }

    // GỌI LẠI fetchEquipmentTypes KHI pageNum, pageSize, hoặc selectedStatus thay đổi
    // Bỏ searchQuery khỏi dependency array vì nó được xử lý client-side
    useEffect(() => {
        fetchEquipmentTypes()
    }, [pageNum, pageSize, selectedStatus])

    // Lọc dữ liệu cục bộ (Client-side Search)
    const filteredEquipmentTypes = useMemo(() => {
        if (!searchQuery.trim()) {
            // Nếu không có tìm kiếm, trả về mảng gốc
            return equipmentTypeItems.filter((item) => allowedStatuses.includes(item.equipmentTypeStatus))
        }

        const lowerCaseQuery = searchQuery.trim().toLowerCase()

        return equipmentTypeItems
            .filter((item) => allowedStatuses.includes(item.equipmentTypeStatus)) // Giữ nguyên lọc status cuối cùng
            .filter((item) =>
                item.equipmentTypeName.toLowerCase().includes(lowerCaseQuery) ||
                item.equipmentTypeCode.toLowerCase().includes(lowerCaseQuery)
            )
    }, [equipmentTypeItems, searchQuery, allowedStatuses]) // Phụ thuộc vào dữ liệu server và query tìm kiếm

    // --- Các hàm khác giữ nguyên ---

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Available":
                return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
            case "InUse":
                return <Badge className="bg-blue-500 hover:bg-blue-600">In Use</Badge>
            case "Maintenance":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Maintenance</Badge>
            case "Damaged":
                return <Badge className="bg-red-500 hover:bg-red-600">Damaged</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const handlePaginationChange = (page: number, pageSize: number | undefined) => {
        // Giữ nguyên bộ lọc hiện tại (searchQuery, selectedStatus) khi đổi trang hoặc pageSize
        setPageNum(page)
        setPageSize(pageSize || 10)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // CHỈ cập nhật searchQuery, KHÔNG cần reset pageNum vì việc lọc là cục bộ
        setSearchQuery(e.target.value)
    }

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value)
        // QUAN TRỌNG: Reset trang về 1 khi thay đổi trạng thái lọc (Server-side Filter)
        setPageNum(1)
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4 items-center w-full">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search equipment types by name or code..."
                                className="pl-8 w-full"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <Select value={selectedStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Status" />
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
                    <Dialog open={isCreateTypeModalOpen} onOpenChange={setIsCreateTypeModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-500 hover:bg-orange-600">
                                New Equipment Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Equipment Type</DialogTitle>
                            </DialogHeader>
                            <CreateEquipmentType
                                onClose={() => setIsCreateTypeModalOpen(false)}
                                onSuccess={fetchEquipmentTypes}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <Card>
                    <Table>
                        <TableHeader className="bg-blue-50">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredEquipmentTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No equipment types found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEquipmentTypes.map((item: EquipmentType, index: number) => (
                                    <TableRow key={item.equipmentTypeId ?? `fallback-type-${index}`}>
                                        <TableCell>
                                            <div className="font-medium">{item.equipmentTypeName}</div>
                                        </TableCell>
                                        <TableCell>{item.equipmentTypeCode}</TableCell>
                                        <TableCell>{item.equipmentTypeQuantity}</TableCell>
                                        <TableCell>{getStatusBadge(item.equipmentTypeStatus)}</TableCell>
                                        <TableCell>
                                            {item.equipmentTypeUrlImg ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="link"
                                                            onClick={() => setSelectedImageUrl(item.equipmentTypeUrlImg)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Image for {item.equipmentTypeName}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="flex justify-center p-4">
                                                            <img
                                                                src={selectedImageUrl || ""}
                                                                alt={`Image for ${item.equipmentTypeName}`}
                                                                className="max-w-full max-h-[256px] object-contain"
                                                            />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <span className="text-muted-foreground">No Image</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <EllipsisVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedEquipmentType(item)
                                                            setIsEditTypeModalOpen(true)
                                                        }}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedEquipmentType(item)
                                                            setIsDeleteTypeModalOpen(true)
                                                        }}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
            <div className="flex justify-end p-4">
                <Pagination
                    current={pageNum}
                    pageSize={pageSize}
                    total={totalTypeItems}
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                    onChange={handlePaginationChange}
                    showSizeChanger
                    onShowSizeChange={(current, size) => {
                        setPageNum(1)
                        setPageSize(size)
                    }}
                />
            </div>
            {selectedEquipmentType && (
                <>
                    <Dialog open={isEditTypeModalOpen} onOpenChange={setIsEditTypeModalOpen}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Equipment Type</DialogTitle>
                            </DialogHeader>
                            <EditEquipmentType
                                equipmentType={selectedEquipmentType}
                                onClose={() => setIsEditTypeModalOpen(false)}
                                onSuccess={fetchEquipmentTypes}
                            />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isDeleteTypeModalOpen} onOpenChange={setIsDeleteTypeModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Equipment Type</DialogTitle>
                            </DialogHeader>
                            <DeleteEquipmentType
                                equipmentTypeId={selectedEquipmentType.equipmentTypeId}
                                equipmentTypeName={selectedEquipmentType.equipmentTypeName}
                                onClose={() => setIsDeleteTypeModalOpen(false)}
                                onSuccess={fetchEquipmentTypes}
                            />
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </>
    )
}