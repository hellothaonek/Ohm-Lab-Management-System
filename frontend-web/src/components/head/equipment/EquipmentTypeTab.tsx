"use client"

import { useState, useEffect } from "react"
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
import { QRCodeCanvas } from "qrcode.react"
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
    equipmentTypeUrlImg?: string;
    equipmentTypeCreateDate?: string;
}

export default function EquipmentTypeTab() {
    const [searchQuery, setSearchQuery] = useState("")
    const [equipmentTypeItems, setEquipmentTypeItems] = useState<EquipmentType[]>([])
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalTypeItems, setTotalTypeItems] = useState(0)
    const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false)
    const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false)
    const [isDeleteTypeModalOpen, setIsDeleteTypeModalOpen] = useState(false)
    const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType | null>(null)
    const [selectedTypeQrCode, setSelectedTypeQrCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchEquipmentTypes = async () => {
        setLoading(true)
        try {
            const response = await searchEquipmentType({
                pageNum,
                pageSize,
                keyWord: searchQuery,
                status: ""
            })
            setEquipmentTypeItems(response.pageData)
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

    useEffect(() => {
        fetchEquipmentTypes()
    }, [pageNum, pageSize, searchQuery])

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
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
        setPageNum(page)
        setPageSize(pageSize || 10)
    }

    return (
        <Card>
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Equipment Type</h1>
                        </div>
                        <div className="flex gap-2">
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
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search equipment types..."
                            className="pl-8 w-full sm:w-80"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setPageNum(1)
                            }}
                        />
                    </div>
                </div>
                <Card>
                    <div className="grid grid-cols-[1fr_1fr_120px_120px_80px] gap-2 p-4 font-medium border-b">
                        <div>Name</div>
                        <div>Code</div>
                        <div>Quantity</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>
                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Loading...
                        </div>
                    ) : equipmentTypeItems.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No equipment types found matching your filters.
                        </div>
                    ) : (
                        equipmentTypeItems.map((item: EquipmentType, index: number) => (
                            <div
                                key={item.equipmentTypeId ?? `fallback-type-${index}`}
                                className="grid grid-cols-[1fr_1fr_120px_120px_80px] gap-2 p-4 border-b last:border-0 items-center"
                            >
                                <div>
                                    <div className="font-medium">{item.equipmentTypeName}</div>
                                </div>
                                <div className="text-sm">{item.equipmentTypeCode}</div>
                                <div className="text-sm">{item.equipmentTypeQuantity}</div>
                                <div>{getStatusBadge(item.equipmentTypeStatus)}</div>
                                <div>
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
                                </div>
                            </div>
                        ))
                    )}
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
                        <DialogContent>
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
        </Card>
    )
}