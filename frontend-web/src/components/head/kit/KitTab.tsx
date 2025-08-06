"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Search, Filter, EllipsisVertical, Eye } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Pagination } from "antd"
import { QRCodeCanvas } from "qrcode.react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { searchKit } from "@/services/kitServices"
import CreateKit from "./CreateKit"
import DeleteKit from "./DeleteKit"

interface KitTemplateTabProps {
    setShowReportDialog: (value: boolean) => void
}

interface Kit {
    kitId: string
    kitTemplateId: string
    kitTemplateName: string
    kitName: string
    kitDescription: string
    kitUrlImg: string
    kitUrlQr: string
    kitCreateDate: string
    kitStatus: string
}

export default function KitTab({ setShowReportDialog }: KitTemplateTabProps) {
    const [kitSearch, setKitSearch] = useState("")
    const [kitStatusFilter, setKitStatusFilter] = useState("all")
    const [kits, setKits] = useState<Kit[]>([])
    const [loading, setLoading] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedKit, setSelectedKit] = useState<{ id: string; name: string } | null>(null)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    const fetchKits = useCallback(async () => {
        setLoading(true)
        try {
            const response = await searchKit({
                pageNum,
                pageSize,
                keyWord: kitSearch,
                status: kitStatusFilter === "all" ? "" : kitStatusFilter,
            })
            setKits(response.pageData)
            setTotalItems(response.pageInfo.totalItem)
        } catch (error) {
            console.error("Failed to fetch kits:", error)
        } finally {
            setLoading(false)
        }
    }, [kitSearch, kitStatusFilter, pageNum, pageSize])

    useEffect(() => {
        fetchKits()
    }, [fetchKits])

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "valid":
                return <Badge className="bg-green-500 hover:bg-green-600">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
            case "invalid":
                return <Badge className="bg-red-500 hover:bg-red-600">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const handleDeleteClick = (id: string, name: string) => {
        setSelectedKit({ id, name })
        setIsDeleteDialogOpen(true)
    }

    const handleCreateSuccess = () => {
        setPageNum(1)
        fetchKits()
        setIsCreateDialogOpen(false)
        setShowReportDialog(false)
    }

    const handleDeleteSuccess = () => {
        setPageNum(1)
        fetchKits()
        setIsDeleteDialogOpen(false)
        setSelectedKit(null)
    }

    const handlePaginationChange = (page: number, size?: number) => {
        setPageNum(page)
        if (size && size !== pageSize) {
            setPageSize(size)
            setPageNum(1)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Kits</CardTitle>
                    <CardDescription>Manage all lab kits</CardDescription>
                </div>
                <Button onClick={() => {
                    setIsCreateDialogOpen(true)
                    setShowReportDialog(true)
                }} className="bg-orange-500 hover:bg-orange-600">
                    New Kit
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-4 justify-start">
                    <div className="relative w-[350px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search kits..."
                            className="pl-8 w-full"
                            value={kitSearch}
                            onChange={(e) => setKitSearch(e.target.value)}
                        />
                    </div>
                    <Select value={kitStatusFilter} onValueChange={setKitStatusFilter}>
                        <SelectTrigger className="w-[130px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <span>Status</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Valid">Valid</SelectItem>
                            <SelectItem value="Invalid">Invalid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="rounded-md border">
                    <div className="grid grid-cols-[1fr_1fr_1fr_150px_120px_100px] gap-2 p-4 font-medium border-b">
                        <div className="flex items-center gap-1 cursor-pointer">
                            Name
                        </div>
                        <div>Kit Template</div>
                        <div>Description</div>
                        <div>Created Date</div>
                        <div className="flex items-center gap-1 cursor-pointer">
                            Status
                        </div>
                        <div>Actions</div>
                    </div>

                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Loading kits...
                        </div>
                    ) : kits.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No kits found matching your filters.
                        </div>
                    ) : (
                        kits.map((item) => (
                            <div
                                key={item.kitId}
                                className="grid grid-cols-[1fr_1fr_1fr_150px_120px_100px] gap-2 p-4 border-b last:border-0 items-center"
                            >
                                <div className="font-medium">{item.kitName}</div>
                                <div className="text-sm">{item.kitTemplateName}</div>
                                <div className="text-sm">{item.kitDescription}</div>
                                <div className="text-sm">{new Date(item.kitCreateDate).toLocaleDateString()}</div>
                                <div>{getStatusBadge(item.kitStatus)}</div>
                                <div className="flex items-center gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>QR Code for {item.kitName}</DialogTitle>
                                            </DialogHeader>
                                            <div className="flex justify-center">
                                                <QRCodeCanvas value={item.kitUrlQr} size={256} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <EllipsisVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => alert(`Edit ${item.kitName}`)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteClick(item.kitId, item.kitName)}>
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-4 flex justify-end">
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
            </CardContent>
            <CreateKit
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                    setIsCreateDialogOpen(open)
                    setShowReportDialog(open)
                }}
                onSuccess={handleCreateSuccess}
            />
            {selectedKit && (
                <DeleteKit
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open)
                        if (!open) setSelectedKit(null)
                    }}
                    kitId={selectedKit.id}
                    kitName={selectedKit.name}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}
        </Card>
    )
}