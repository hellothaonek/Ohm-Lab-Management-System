"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, Edit2, Trash } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Pagination } from "antd"
import { searchKitTemplate } from "@/services/kitTemplateServices"
import CreateKitTemplate from "@/components/head/kit/CreateKitTemplate"
import DeleteKitTemplate from "@/components/head/kit/DeleteKitTemplate"
import EditKitTemplate from "@/components/head/kit/EditKitTemplate"

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

export default function KitTemplatePage({ setShowReportDialog }: KitTemplateTabProps) {
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
                keyWord: "",
                status: ""
            })
            setKitTemplates(response.pageData || [])
            setTotalItems(response.pageInfo.totalItem)
        } catch (error) {
            console.error("Failed to fetch kit templates:", error)
            setKitTemplates([])
            setTotalItems(0)
        } finally {
            setLoading(false)
        }
    }, [pageNum, pageSize])

    useEffect(() => {
        fetchKitTemplates()
    }, [fetchKitTemplates])

    const filteredKitTemplates = useMemo(() => {
        let currentTemplates = kitTemplates

        if (kitTemplateStatusFilter !== "all") {
            currentTemplates = currentTemplates.filter(item =>
                item.kitTemplateStatus.toLowerCase() === kitTemplateStatusFilter.toLowerCase()
            )
        }

        if (kitTemplateSearch.trim()) {
            const lowerCaseQuery = kitTemplateSearch.trim().toLowerCase()
            currentTemplates = currentTemplates.filter((item) =>
                item.kitTemplateName.toLowerCase().includes(lowerCaseQuery) ||
                item.kitTemplateDescription.toLowerCase().includes(lowerCaseQuery) ||
                item.kitTemplateId.toLowerCase().includes(lowerCaseQuery)
            )
        }

        return currentTemplates
    }, [kitTemplates, kitTemplateSearch, kitTemplateStatusFilter])

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
        const kitToDelete = kitTemplates.find(k => k.kitTemplateId === id)
        setSelectedKitTemplate(kitToDelete || { kitTemplateId: id, kitTemplateName: name } as any)
        setIsDeleteDialogOpen(true)
    }

    const handleStatusFilterChange = (value: string) => {
        setKitTemplateStatusFilter(value)
    }

    const handleCreateSuccess = () => {
        setPageNum(1)
        fetchKitTemplates()
        setIsCreateDialogOpen(false)
    }

    const handleEditSuccess = () => {
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
            <h1 className="text-3xl font-bold mb-5">Kit Template Management</h1>
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
                    <Select value={kitTemplateStatusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-48">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Status" />
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
                        ) : filteredKitTemplates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No kit templates found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredKitTemplates.map((item) => (
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
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEditClick(item)}
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteClick(item.kitTemplateId, item.kitTemplateName)}
                                                title="Delete"
                                            >
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
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