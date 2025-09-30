"use client"

import { useState, useEffect, useMemo } from "react" 
import { Search, EllipsisVertical } from "lucide-react"
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
    equipmentTypeUrlImg?: string;
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
    const [rawEquipmentTypeItems, setRawEquipmentTypeItems] = useState<EquipmentType[]>([])

    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalTypeItems, setTotalTypeItems] = useState(0)
    const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false)
    const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false)
    const [isDeleteTypeModalOpen, setIsDeleteTypeModalOpen] = useState(false)
    const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchEquipmentTypes = async () => {
        setLoading(true)
        try {
            const response = await searchEquipmentType({
                pageNum,
                pageSize,
                keyWord: "", 
                status: ""   
            })
            setRawEquipmentTypeItems(response.pageData || [])
            setTotalTypeItems(response.pageInfo.totalItem)
            setPageNum(response.pageInfo.page)
            setPageSize(response.pageInfo.size)
        } catch (error) {
            console.error("Error fetching equipment types:", error)
            setRawEquipmentTypeItems([])
            setTotalTypeItems(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEquipmentTypes()
    }, [pageNum, pageSize])

    const filteredEquipmentTypeItems = useMemo(() => {
        const lowerCaseSearch = searchQuery.toLowerCase().trim();

        return rawEquipmentTypeItems.filter(item => {
            const matchesSearch =
                lowerCaseSearch === "" ||
                item.equipmentTypeName.toLowerCase().includes(lowerCaseSearch) ||
                item.equipmentTypeCode.toLowerCase().includes(lowerCaseSearch)

            const matchesStatus =
                selectedStatus === "all" || item.equipmentTypeStatus === selectedStatus

            return matchesSearch && matchesStatus
        })
    }, [rawEquipmentTypeItems, searchQuery, selectedStatus]) 

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
        setSearchQuery("");
        setSelectedStatus("all");
        setPageNum(page)
        setPageSize(pageSize || 10)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value)
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
                                placeholder="Search equipment types..."
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
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredEquipmentTypeItems.length === 0 ? ( 
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No equipment types found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEquipmentTypeItems.map((item: EquipmentType, index: number) => ( 
                                    <TableRow key={item.equipmentTypeId ?? `fallback-type-${index}`}>
                                        <TableCell>
                                            <div className="font-medium">{item.equipmentTypeName}</div>
                                        </TableCell>
                                        <TableCell>{item.equipmentTypeCode}</TableCell>
                                        <TableCell>{item.equipmentTypeQuantity}</TableCell>
                                        <TableCell>{getStatusBadge(item.equipmentTypeStatus)}</TableCell>
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
        </>
    )
}