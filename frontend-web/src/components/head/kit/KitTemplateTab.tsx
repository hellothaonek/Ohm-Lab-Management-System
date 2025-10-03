// src/components/head/kit/KitTemplateTab.tsx
"use client"

import Link from "next/link" // <--- Thêm import Link của Next.js
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, EllipsisVertical, Eye } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Pagination } from "antd"
import { searchKitTemplate } from "@/services/kitTemplateServices"
import CreateKitTemplate from "./CreateKitTemplate"
import DeleteKitTemplate from "./DeleteKitTemplate"
import EditKitTemplate from "./EditKitTemplate"

interface KitTemplateTabProps {
    setShowReportDialog: (value: boolean) => void
}

interface KitTemplate {
    kitTemplateId: string
    kitTemplateName: string
    kitTemplateQuantity: number
    kitTemplateDescription: string
    kitTemplateUrlImg: string
    kitTemplateStatus: string
}

export default function KitTemplateTab({ setShowReportDialog }: KitTemplateTabProps) {
    const [kitTemplateSearch, setKitTemplateSearch] = useState("")
    const [kitTemplateStatusFilter, setKitTemplateStatusFilter] = useState("all")
    const [kitTemplates, setKitTemplates] = useState<KitTemplate[]>([])
    const [loading, setLoading] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedKitTemplate, setSelectedKitTemplate] = useState<KitTemplate | null>(null)
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    const fetchKitTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const response = await searchKitTemplate({
                pageNum,
                pageSize,
                keyWord: kitTemplateSearch,
                status: kitTemplateStatusFilter === "all" ? "" : kitTemplateStatusFilter
            })
            setKitTemplates(response.pageData)
            setTotalItems(response.pageInfo.totalItem)
        } catch (error) {
            console.error("Failed to fetch kit templates:", error)
        } finally {
            setLoading(false)
        }
    }, [kitTemplateSearch, kitTemplateStatusFilter, pageNum, pageSize])

    useEffect(() => {
        fetchKitTemplates()
    }, [fetchKitTemplates])

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

    const handleEditClick = (kitTemplate: KitTemplate) => {
        setSelectedKitTemplate(kitTemplate)
        setIsEditDialogOpen(true)
    }

    const handleDeleteClick = (id: string, name: string) => {
        setSelectedKitTemplate({ id, name } as any)
        setIsDeleteDialogOpen(true)
    }

    const handleCreateSuccess = () => {
        setPageNum(1)
        fetchKitTemplates()
        setIsCreateDialogOpen(false)
        setShowReportDialog(false)
    }

    const handleEditSuccess = () => {
        setPageNum(1)
        fetchKitTemplates()
        setIsEditDialogOpen(false)
        setSelectedKitTemplate(null)
    }

    const handleDeleteSuccess = () => {
        setPageNum(1)
        fetchKitTemplates()
        setIsDeleteDialogOpen(false)
        setSelectedKitTemplate(null)
    }

    const handlePaginationChange = (page: number, size?: number) => {
        setPageNum(page)
        if (size && size !== pageSize) {
            setPageSize(size)
            setPageNum(1)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-4">
                    <div className="relative w-[350px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search kit templates..."
                            className="pl-8 w-full"
                            value={kitTemplateSearch}
                            onChange={(e) => setKitTemplateSearch(e.target.value)}
                        />
                    </div>
                    <Select value={kitTemplateStatusFilter} onValueChange={setKitTemplateStatusFilter}>
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
                <Button
                    onClick={() => {
                        setIsCreateDialogOpen(true)
                        setShowReportDialog(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-600 ml-auto"
                >
                    New Kit Template
                </Button>
            </div>
            <Card>
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : kitTemplates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No kit templates found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            kitTemplates.map((item) => (
                                <TableRow key={item.kitTemplateId}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/head/dashboard/kit-template/${item.kitTemplateId}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {item.kitTemplateName}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">{item.kitTemplateQuantity}</TableCell>
                                    <TableCell>
                                        {item.kitTemplateUrlImg ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" onClick={() => setSelectedImageUrl(item.kitTemplateUrlImg)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Image for {item.kitTemplateName}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="flex justify-center p-4">
                                                        <img
                                                            src={selectedImageUrl || ''}
                                                            alt={`Image for ${item.kitTemplateName}`}
                                                            className="max-w-full max-h-[256px] object-contain"
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <span className="text-muted-foreground">No Image</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">{getStatusBadge(item.kitTemplateStatus)}</TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <EllipsisVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleEditClick(item)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(item.kitTemplateId, item.kitTemplateName)}>
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
            <CreateKitTemplate
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                    setIsCreateDialogOpen(open)
                    setShowReportDialog(open)
                }}
                onSuccess={handleCreateSuccess}
            />
            {selectedKitTemplate && (
                <DeleteKitTemplate
                    open={isDeleteDialogOpen}
                    onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open)
                        if (!open) setSelectedKitTemplate(null)
                    }}
                    kitTemplateId={selectedKitTemplate.kitTemplateId}
                    kitTemplateName={selectedKitTemplate.kitTemplateName}
                    onSuccess={handleDeleteSuccess}
                />
            )}
            {selectedKitTemplate && (
                <EditKitTemplate
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        setIsEditDialogOpen(open)
                        if (!open) setSelectedKitTemplate(null)
                    }}
                    kitTemplate={selectedKitTemplate}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    )
}