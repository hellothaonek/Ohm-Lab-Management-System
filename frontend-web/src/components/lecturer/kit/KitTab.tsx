"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

export default function LecturerKitTab({ setShowReportDialog }: KitTemplateTabProps) {
    const [kitSearch, setKitSearch] = useState("")
    const [kitStatusFilter, setKitStatusFilter] = useState("all")
    const [kits, setKits] = useState<Kit[]>([])
    const [loading, setLoading] = useState(false)
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
            <Card>
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Kit Template</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    Loading kits...
                                </TableCell>
                            </TableRow>
                        ) : kits.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No kits found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            kits.map((item) => (
                                <TableRow key={item.kitId}>
                                    <TableCell className="font-medium">{item.kitName}</TableCell>
                                    <TableCell>{item.kitTemplateName}</TableCell>
                                    <TableCell>{item.kitDescription}</TableCell>
                                    <TableCell>{new Date(item.kitCreateDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{getStatusBadge(item.kitStatus)}</TableCell>
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