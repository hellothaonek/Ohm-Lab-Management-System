"use client"

import { useState, useEffect, useCallback, useMemo } from "react" // 👈 Import useMemo
import { Search, Eye, EllipsisVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { searchEquipment } from "@/services/equipmentServices"
import CreateEquipment from "@/components/head/equipment/CreateEquipment"
import { QRCodeCanvas } from "qrcode.react"
import DeleteEquipment from "@/components/head/equipment/DeleteEquipment"
import EditEquipment from "@/components/head/equipment/EditEquipment"
import { Pagination } from 'antd'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Equipment {
    equipmentId: number;
    equipmentName: string;
    equipmentCode: string;
    equipmentNumberSerial: string;
    equipmentStatus: string;
    equipmentQr: string
}

// Định nghĩa các tùy chọn trạng thái
const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Available", label: "Available" },
    { value: "InUse", label: "InUse" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Damaged", label: "Damaged" },
]

export default function EquipmentTab() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    // Dữ liệu thô từ API (không lọc)
    const [rawEquipmentItems, setRawEquipmentItems] = useState<Equipment[]>([]) 
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    // Giữ nguyên tổng số item của trang hiện tại (trước khi lọc cục bộ)
    const [totalItems, setTotalItems] = useState(0) 
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
    const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null)

    const fetchEquipment = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            // KHÔNG TRUYỀN keyWord VÀ status VÀO API
            const response = await searchEquipment({
                pageNum,
                pageSize,
                keyWord: "", // Hoặc không truyền
                status: "", // Hoặc không truyền
            })
            // Lưu dữ liệu thô
            setRawEquipmentItems(response.pageData || []) 
            setTotalItems(response.pageInfo?.totalItem || 0)
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch equipment"
            setError(errorMessage)
            console.error("Error fetching equipment:", err)
            setRawEquipmentItems([])
        } finally {
            setIsLoading(false)
        }
    }, [pageNum, pageSize]) // Chỉ phụ thuộc vào pageNum và pageSize

    useEffect(() => {
        fetchEquipment()
    }, [fetchEquipment])

    // LỌC DỮ LIỆU CỤC BỘ DÙNG useMemo
    const filteredEquipmentItems = useMemo(() => {
        const lowerCaseSearch = searchQuery.toLowerCase().trim();
        
        return rawEquipmentItems.filter(item => {
            // Lọc theo từ khóa tìm kiếm (Tương tự ví dụ của bạn)
            const matchesSearch =
                lowerCaseSearch === "" ||
                item.equipmentName.toLowerCase().includes(lowerCaseSearch) ||
                item.equipmentCode.toLowerCase().includes(lowerCaseSearch) ||
                item.equipmentNumberSerial.toLowerCase().includes(lowerCaseSearch); // Thêm serial number

            // Lọc theo trạng thái
            const matchesStatus = 
                selectedStatus === "all" || item.equipmentStatus === selectedStatus;

            return matchesSearch && matchesStatus;
        })
    }, [rawEquipmentItems, searchQuery, selectedStatus]); // Phụ thuộc vào dữ liệu thô, từ khóa và trạng thái

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
        // Với lọc cục bộ, khi chuyển trang phải reset filter/search (nếu API vẫn trả về từng trang)
        // Nếu API trả về toàn bộ data, logic này sẽ khác
        setSearchQuery(""); // Reset search khi chuyển trang (nếu muốn)
        setSelectedStatus("all"); // Reset status khi chuyển trang (nếu muốn)
        setPageNum(page)
        setPageSize(pageSize || 10)
    }

    // Xử lý thay đổi search và đặt lại pageNum về 1 (nếu muốn)
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // Không cần setPageNum(1) vì ta đang lọc cục bộ trên dữ liệu của trang hiện tại
    };

    // Xử lý thay đổi trạng thái và đặt lại pageNum về 1 (nếu muốn)
    const handleStatusChange = (value: string) => {
        setSelectedStatus(value)
        // Không cần setPageNum(1) vì ta đang lọc cục bộ trên dữ liệu của trang hiện tại
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center w-full">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search equipment by Name, Code, Serial..."
                            className="pl-8 w-full"
                            value={searchQuery}
                            onChange={handleSearchChange} // Sử dụng hàm handleSearchChange mới
                        />
                    </div>
                    {/* THÊM COMPONENT SELECT CHO BỘ LỌC TRẠNG THÁI */}
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
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            New Equipment
                        </Button>
                    </DialogTrigger>
                    <CreateEquipment
                        open={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onCreate={() => {
                            setIsCreateModalOpen(false)
                            fetchEquipment()
                        }}
                    />
                </Dialog>
            </div>
            <Card>
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Serial Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>QR Code</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    Loading equipment...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-red-500">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : filteredEquipmentItems.length === 0 ? ( // 👈 SỬ DỤNG filteredEquipmentItems
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No equipment found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEquipmentItems.map((item: Equipment, index: number) => ( // 👈 SỬ DỤNG filteredEquipmentItems
                                <TableRow key={item.equipmentId ?? `fallback-${index}`}>
                                    <TableCell>
                                        <div className="font-medium">{item.equipmentName}</div>
                                    </TableCell>
                                    <TableCell>{item.equipmentCode}</TableCell>
                                    <TableCell>{item.equipmentNumberSerial}</TableCell>
                                    <TableCell>{getStatusBadge(item.equipmentStatus)}</TableCell>
                                    <TableCell>
                                        {item.equipmentQr ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" onClick={() => setSelectedQrCode(item.equipmentQr!)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>QR Code for {item.equipmentName}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="flex justify-center p-4">
                                                        <QRCodeCanvas value={selectedQrCode || ''} size={256} />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <span className="text-muted-foreground">No QR</span>
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
                                                        setSelectedEquipment(item)
                                                        setIsEditModalOpen(true)
                                                    }}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedEquipment(item)
                                                        setIsDeleteModalOpen(true)
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

            <div className="flex justify-end p-4">
                <Pagination
                    current={pageNum}
                    pageSize={pageSize}
                    total={totalItems}
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                    onChange={handlePaginationChange}
                    showSizeChanger
                    onShowSizeChange={(current, size) => {
                        setPageNum(1)
                        setPageSize(size)
                    }}
                />
            </div>
            {selectedEquipment && (
                <>
                    <EditEquipment
                        open={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false)
                            setSelectedEquipment(null)
                        }}
                        onEdit={fetchEquipment}
                        equipmentId={selectedEquipment.equipmentId.toString()}
                    />
                    <DeleteEquipment
                        open={isDeleteModalOpen}
                        onClose={() => {
                            setIsDeleteModalOpen(false)
                            setSelectedEquipment(null)
                        }}
                        onDelete={fetchEquipment}
                        equipmentName={selectedEquipment.equipmentName}
                        equipmentId={selectedEquipment.equipmentId.toString()}
                    />
                </>
            )}
        </div>
    )
}