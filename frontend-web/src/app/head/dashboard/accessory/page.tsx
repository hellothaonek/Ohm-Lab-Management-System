"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Eye, Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { searchAccessory } from "@/services/accessoryServices"
import CreateAccessory from "@/components/head/accessory/CreateAccessory"
import EditAccessory from "@/components/head/accessory/EditAccessory"
import DeleteAccessory from "@/components/head/accessory/DeleteAccessory"
import { Pagination } from 'antd'
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Accessory {
    accessoryId: number
    accessoryName: string
    accessoryDescription: string
    accessoryUrlImg: string
    accessoryCreateDate: string
    accessoryValueCode: string
    accessoryCase: string
    accessoryStatus: string
}

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Valid", label: "Valid" },
    { value: "Invalid", label: "Invalid" },
]

export default function AccessoryPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [rawAccessoryItems, setRawAccessoryItems] = useState<Accessory[]>([])
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null)

    const fetchAccessories = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await searchAccessory({
                pageNum,
                pageSize,
                keyWord: "",
                status: "",
            })
            setRawAccessoryItems(response.pageData || [])
            setTotalItems(response.pageInfo?.totalItem || 0)
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch accessories"
            setError(errorMessage)
            console.error("Error fetching accessories:", err)
            setRawAccessoryItems([])
        } finally {
            setIsLoading(false)
        }
    }, [pageNum, pageSize])

    useEffect(() => {
        fetchAccessories()
    }, [fetchAccessories])

    const filteredAccessoryItems = useMemo(() => {
        const lowerCaseSearch = searchQuery.toLowerCase().trim()

        return rawAccessoryItems.filter(item => {
            const matchesSearch =
                lowerCaseSearch === "" ||
                item.accessoryName.toLowerCase().includes(lowerCaseSearch) ||
                item.accessoryValueCode.toLowerCase().includes(lowerCaseSearch) ||
                item.accessoryDescription.toLowerCase().includes(lowerCaseSearch)

            const matchesStatus =
                selectedStatus === "all" || item.accessoryStatus === selectedStatus

            return matchesSearch && matchesStatus
        })
    }, [rawAccessoryItems, searchQuery, selectedStatus])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Valid":
                return <Badge className="bg-green-500 hover:bg-green-600">Valid</Badge>
            case "Invalid":
                return <Badge className="bg-red-500 hover:bg-red-600">Invalid</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const handlePaginationChange = (page: number, pageSize: number | undefined) => {
        setSearchQuery("")
        setSelectedStatus("all")
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-5">Accessory Management</h1>
            <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center w-full">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
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
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            New Accessory
                        </Button>
                    </DialogTrigger>
                    <CreateAccessory
                        open={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onCreate={() => {
                            setIsCreateModalOpen(false)
                            fetchAccessories()
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
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    Loading accessories...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-red-500">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : filteredAccessoryItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No accessories found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAccessoryItems.map((item: Accessory, index: number) => (
                                <TableRow key={item.accessoryId ?? `fallback-${index}`}>
                                    <TableCell>
                                        <div className="font-medium">{item.accessoryName}</div>
                                    </TableCell>
                                    <TableCell>{item.accessoryValueCode}</TableCell>
                                    <TableCell>{item.accessoryDescription}</TableCell>
                                    <TableCell>{getStatusBadge(item.accessoryStatus)}</TableCell>
                                    <TableCell>
                                        {item.accessoryUrlImg ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" onClick={() => setSelectedImageUrl(item.accessoryUrlImg)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Image for {item.accessoryName}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="flex justify-center p-4">
                                                        <img
                                                            src={selectedImageUrl || ''}
                                                            alt={`Image for ${item.accessoryName}`}
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
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedAccessory(item)
                                                    setIsEditModalOpen(true)
                                                }}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedAccessory(item)
                                                    setIsDeleteModalOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
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

            {selectedAccessory && (
                <>
                    <EditAccessory
                        open={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false)
                            setSelectedAccessory(null)
                        }}
                        onEdit={() => {
                            setIsEditModalOpen(false)
                            setSelectedAccessory(null)
                            fetchAccessories()
                        }}
                        accessory={selectedAccessory}
                    />
                    <DeleteAccessory
                        open={isDeleteModalOpen}
                        onClose={() => {
                            setIsDeleteModalOpen(false)
                            setSelectedAccessory(null)
                        }}
                        onDelete={() => {
                            setIsDeleteModalOpen(false)
                            setSelectedAccessory(null)
                            fetchAccessories()
                        }}
                        accessoryId={selectedAccessory.accessoryId}
                        accessoryName={selectedAccessory.accessoryName}
                    />
                </>
            )}
        </div>
    )
}