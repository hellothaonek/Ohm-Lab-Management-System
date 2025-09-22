"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, EllipsisVertical } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Pagination } from "antd"
import { searchKitTemplate } from "@/services/kitTemplateServices"

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

    const handlePaginationChange = (page: number, size?: number) => {
        setPageNum(page)
        if (size && size !== pageSize) {
            setPageSize(size)
            setPageNum(1)
        }
    }

    return (
        <div className="space-y-6">
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
            <Card>
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-center">Description</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : kitTemplates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No kit templates found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            kitTemplates.map((item) => (
                                <TableRow key={item.kitTemplateId}>
                                    <TableCell className="font-medium">{item.kitTemplateName}</TableCell>
                                    <TableCell className="text-center">{item.kitTemplateQuantity}</TableCell>
                                    <TableCell className="text-center">{item.kitTemplateDescription}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(item.kitTemplateStatus)}</TableCell>
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
        </div>
    )
}