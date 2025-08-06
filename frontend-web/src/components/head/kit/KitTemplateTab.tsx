"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Search, Filter, EllipsisVertical } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Pagination } from "antd"
import { searchKitTemplate } from "@/services/kitTemplateServices"
import CreateKitTemplate from "./CreateKitTemplate"
import DeleteKitTemplate from "./DeleteKitTemplate"

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
    const [selectedKitTemplate, setSelectedKitTemplate] = useState<{ id: string; name: string } | null>(null)
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

    const handleDeleteClick = (id: string, name: string) => {
        setSelectedKitTemplate({ id, name })
        setIsDeleteDialogOpen(true)
    }

    const handleCreateSuccess = () => {
        setPageNum(1)
        fetchKitTemplates()
        setIsCreateDialogOpen(false)
        setShowReportDialog(false)
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Kit Templates</CardTitle>
                    <CardDescription>View and manage all lab kit templates</CardDescription>
                </div>
                <Button onClick={() => {
                    setIsCreateDialogOpen(true)
                    setShowReportDialog(true)
                }} className="bg-orange-500 hover:bg-orange-600">
                    New Kit Template
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-4 justify-start">
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
                <div className="rounded-md border">
                    <div className="grid grid-cols-[1fr_100px_1fr_120px_100px] gap-2 p-4 font-medium border-b">
                        <div className="flex items-center gap-1 cursor-pointer">
                            Name
                        </div>
                        <div className="text-center">Quantity</div>
                        <div className="text-center">Description</div>
                        <div className="flex items-center gap-1 cursor-pointer">
                            Status
                        </div>
                        <div>Actions</div>
                    </div>

                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground">
                            Loading...
                        </div>
                    ) : kitTemplates.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No kit templates found matching your filters.
                        </div>
                    ) : (
                        kitTemplates.map((item) => (
                            <div
                                key={item.kitTemplateId}
                                className="grid grid-cols-[1fr_100px_1fr_120px_100px] gap-2 p-4 border-b last:border-0 items-center"
                            >
                                <div className="font-medium">{item.kitTemplateName}</div>
                                <div className="text-sm text-center">{item.kitTemplateQuantity}</div>
                                <div className="text-sm text-center">{item.kitTemplateDescription}</div>
                                <div>{getStatusBadge(item.kitTemplateStatus)}</div>
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <EllipsisVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => alert(`Edit ${item.kitTemplateName}`)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteClick(item.kitTemplateId, item.kitTemplateName)}>
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
                    kitTemplateId={selectedKitTemplate.id}
                    kitTemplateName={selectedKitTemplate.name}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </Card>
    )
}