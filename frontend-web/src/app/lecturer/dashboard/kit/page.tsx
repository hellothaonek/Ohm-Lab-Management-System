"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Pagination } from "antd"
import { searchKitTemplate } from "@/services/kitTemplateServices"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface KitTemplate {
    kitTemplateId: string
    kitTemplateName: string
    kitTemplateQuantity: number
    kitTemplateDescription: string
    kitTemplateUrlImg: string
    kitTemplateStatus: string
}

export default function KitPage() {
    const [kitTemplateSearch, setKitTemplateSearch] = useState("")
    const [kitTemplateStatusFilter, setKitTemplateStatusFilter] = useState("all")
    const [initialKitTemplates, setInitialKitTemplates] = useState<KitTemplate[]>([])
    const [loading, setLoading] = useState(false)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const fetchKitTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const response = await searchKitTemplate({
                pageNum: 1,
                pageSize: 9999,
                keyWord: "",
                status: ""
            })
            setInitialKitTemplates(response.pageData || [])
        } catch (error) {
            console.error("Failed to fetch kit templates:", error)
            setInitialKitTemplates([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchKitTemplates()
    }, [fetchKitTemplates])

    const kitTemplates = useMemo(() => {
        let filteredItems = initialKitTemplates

        if (kitTemplateStatusFilter !== "all") {
            const filterValue = kitTemplateStatusFilter.toLowerCase()
            filteredItems = filteredItems.filter(item =>
                item.kitTemplateStatus.toLowerCase() === filterValue
            )
        }

        if (kitTemplateSearch) {
            const lowerCaseQuery = kitTemplateSearch.toLowerCase().trim()
            filteredItems = filteredItems.filter(item =>
                item.kitTemplateName.toLowerCase().includes(lowerCaseQuery)
            )
        }

        setTotalItems(filteredItems.length)

        const startIndex = (pageNum - 1) * pageSize
        const endIndex = startIndex + pageSize

        return filteredItems.slice(startIndex, endIndex)
    }, [initialKitTemplates, kitTemplateSearch, kitTemplateStatusFilter, pageNum, pageSize])

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKitTemplateSearch(e.target.value)
        setPageNum(1)
    }

    const handleStatusFilterChange = (value: string) => {
        setKitTemplateStatusFilter(value)
        setPageNum(1)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Kit Management</h1>
            <div className="flex gap-4 mb-4 justify-start">
                <div className="relative w-[350px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search kit templates by name..."
                        className="pl-8 w-full"
                        value={kitTemplateSearch}
                        onChange={handleSearchChange}
                    />
                </div>
                <Select
                    value={kitTemplateStatusFilter}
                    onValueChange={handleStatusFilterChange}
                >
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
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Unavailable">Unavailable</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Card>
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-center">Image</TableHead>
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
                                    <TableCell>
                                        <Link
                                            href={{
                                                pathname: '/lecturer/dashboard/kit/[kit-detail]',
                                                query: { kitTemplateId: item.kitTemplateId },
                                            }}
                                            as={`/lecturer/dashboard/kit/kit-detail?kitTemplateId=${item.kitTemplateId}`}
                                            className="font-medium hover:text-orange-500"
                                        >
                                            {item.kitTemplateName}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">{item.kitTemplateQuantity}</TableCell>
                                    <TableCell className="text-center">
                                        {item.kitTemplateUrlImg ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" onClick={() => setSelectedImage(item.kitTemplateUrlImg)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>{item.kitTemplateName}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="flex justify-center p-4">
                                                        <img
                                                            src={selectedImage || item.kitTemplateUrlImg}
                                                            alt={item.kitTemplateName}
                                                            className="max-w-full max-h-[256px] object-contain"
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <span className="text-muted-foreground">No image</span>
                                        )}
                                    </TableCell>
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