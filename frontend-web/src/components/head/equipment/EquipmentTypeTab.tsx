"use client"

import { useState } from "react"
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

interface EquipmentType {
    typeId: number;
    typeName: string;
    typeCode: string;
    typeStatus: string;
    typeQr: string;
}

export default function EquipmentTypeTab() {
    const [searchQuery, setSearchQuery] = useState("")
    const [equipmentTypeItems] = useState<EquipmentType[]>([
        { typeId: 1, typeName: "Laptop", typeCode: "LAP-001", typeStatus: "Available", typeQr: "qr-lap-001" },
        { typeId: 2, typeName: "Projector", typeCode: "PROJ-002", typeStatus: "In Use", typeQr: "qr-proj-002" },
        { typeId: 3, typeName: "Printer", typeCode: "PRI-003", typeStatus: "Maintenance", typeQr: "" },
    ])
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalTypeItems] = useState(3) // Mock total for equipment types
    const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false)
    const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false)
    const [isDeleteTypeModalOpen, setIsDeleteTypeModalOpen] = useState(false)
    const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType | null>(null)
    const [selectedTypeQrCode, setSelectedTypeQrCode] = useState<string | null>(null)

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "available":
                return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
            case "inuse":
                return <Badge className="bg-blue-500 hover:bg-blue-600">In Use</Badge>
            case "maintenance":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Maintenance</Badge>
            case "out-of-order":
                return <Badge className="bg-red-500 hover:bg-red-600">Out of Order</Badge>
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
                                    <div className="p-4 text-center text-muted-foreground">
                                        Create Equipment Type functionality coming soon.
                                    </div>
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
                        <div>Status</div>
                        <div>QR Code</div>
                        <div>Actions</div>
                    </div>
                    {equipmentTypeItems.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No equipment types found matching your filters.
                        </div>
                    ) : (
                        equipmentTypeItems.map((item: EquipmentType, index: number) => (
                            <div
                                key={item.typeId ?? `fallback-type-${index}`}
                                className="grid grid-cols-[1fr_1fr_120px_120px_80px] gap-2 p-4 border-b last:border-0 items-center"
                            >
                                <div>
                                    <div className="font-medium">{item.typeName}</div>
                                </div>
                                <div className="text-sm">{item.typeCode}</div>
                                <div>{getStatusBadge(item.typeStatus)}</div>
                                <div>
                                    {item.typeQr ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="link" onClick={() => setSelectedTypeQrCode(item.typeQr!)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>QR Code for {item.typeName}</DialogTitle>
                                                </DialogHeader>
                                                <div className="flex justify-center p-4">
                                                    <QRCodeCanvas value={selectedTypeQrCode || ''} size={256} />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <span className="text-muted-foreground">No QR</span>
                                    )}
                                </div>
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
                            <div className="p-4 text-center text-muted-foreground">
                                Edit Equipment Type functionality coming soon.
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isDeleteTypeModalOpen} onOpenChange={setIsDeleteTypeModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Equipment Type</DialogTitle>
                            </DialogHeader>
                            <div className="p-4 text-center text-muted-foreground">
                                Delete Equipment Type functionality coming soon.
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </Card>
    )
}