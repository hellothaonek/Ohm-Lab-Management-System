"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, Edit2, Trash } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Pagination } from "antd"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { searchKit } from "@/services/kitServices"
import Link from "next/link"
import CreateKit from "@/components/head/kit/CreateKit"
import DeleteKit from "@/components/head/kit/DeleteKit"
import EditKit from "@/components/head/kit/EditKit"

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

export default function KitPage() {
    const [fullKits, setFullKits] = useState<Kit[]>([])
    const [kitSearch, setKitSearch] = useState("")
    const [kitStatusFilter, setKitStatusFilter] = useState("all")
    const [kitTemplateFilter, setKitTemplateFilter] = useState("all")
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedKit, setSelectedKit] = useState<Kit | null>(null)
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

    const fetchAllKits = useCallback(async () => {
        setLoading(true)
        try {
            const response = await searchKit({
                pageNum: 1,
                pageSize: 9999,
                keyWord: "",
                status: "",
            })
            setFullKits(response.pageData || [])
            setTotalItems(response.pageData?.length || 0)
        } catch (error) {
            console.error("Failed to fetch all kits:", error)
            setFullKits([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAllKits()
    }, [fetchAllKits])

    const kitTemplateOptions = useMemo(() => {
        const templates = Array.from(new Set(fullKits.map(kit => kit.kitTemplateName)))
        return ['all', ...templates.sort()]
    }, [fullKits])

    const displayedKits = useMemo(() => {
        let filteredKits = fullKits

        if (kitStatusFilter !== "all") {
            filteredKits = filteredKits.filter(kit => kit.kitStatus.toLowerCase() === kitStatusFilter.toLowerCase())
        }

        if (kitTemplateFilter !== "all") {
            filteredKits = filteredKits.filter(kit => kit.kitTemplateName === kitTemplateFilter)
        }

        if (kitSearch) {
            const lowerCaseSearch = kitSearch.toLowerCase().trim()
            filteredKits = filteredKits.filter(kit =>
                kit.kitName.toLowerCase().includes(lowerCaseSearch) ||
                kit.kitTemplateName.toLowerCase().includes(lowerCaseSearch) ||
                kit.kitDescription.toLowerCase().includes(lowerCaseSearch)
            )
        }

        setTotalItems(filteredKits.length)

        const startIndex = (pageNum - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredKits.slice(startIndex, endIndex)
    }, [fullKits, kitSearch, kitStatusFilter, kitTemplateFilter, pageNum, pageSize])

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "valid":
                return <Badge className="bg-green-500 hover:bg-green-600">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
            case "invalid":
                return <Badge className="bg-red-500 hover:bg-red-600">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
            case "inuse":
                return <Badge className="bg-orange-500 hover:bg-orange-600">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const handleEditClick = (kit: Kit) => {
        setSelectedKit(kit)
        setIsEditDialogOpen(true)
    }

    const handleDeleteClick = (kit: Kit) => {
        setSelectedKit(kit)
        setIsDeleteDialogOpen(true)
    }

    const handleActionSuccess = () => {
        setPageNum(1)
        fetchAllKits()
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Kit Management</h1>
            <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                        <div className="relative w-[350px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name..."
                                className="pl-8 w-full"
                                value={kitSearch}
                                onChange={(e) => {
                                    setKitSearch(e.target.value)
                                    setPageNum(1)
                                }}
                            />
                        </div>
                        <Select value={kitStatusFilter} onValueChange={(value) => {
                            setKitStatusFilter(value)
                            setPageNum(1)
                        }}>
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
                                <SelectItem value="InUse">InUse</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={kitTemplateFilter} onValueChange={(value) => {
                            setKitTemplateFilter(value)
                            setPageNum(1)
                        }}>
                            <SelectTrigger className="w-64">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Kit Template" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Templates</SelectItem>
                                {kitTemplateOptions.filter(template => template !== 'all').map(template => (
                                    <SelectItem key={template} value={template}>
                                        {template}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 ml-auto"
                    >
                        New Kit
                    </Button>
                </div>
                <Card>
                    <Table>
                        <TableHeader className="bg-blue-50">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Kit Template</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        Loading kits...
                                    </TableCell>
                                </TableRow>
                            ) : fullKits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No kit available.
                                    </TableCell>
                                </TableRow>
                            ) : totalItems === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No kits match the current filters or search term.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedKits.map((item) => (
                                    <TableRow key={item.kitId}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={`/head/dashboard/kit/${item.kitId}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {item.kitName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{item.kitTemplateName}</TableCell>
                                        <TableCell>{item.kitDescription}</TableCell>
                                        <TableCell>{new Date(item.kitCreateDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {item.kitUrlImg ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="link" onClick={() => setSelectedImageUrl(item.kitUrlImg)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Image for {item.kitName}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="flex justify-center p-4">
                                                            <img
                                                                src={selectedImageUrl || ''}
                                                                alt={`Image for ${item.kitName}`}
                                                                className="max-w-full max-h-[256px] object-contain"
                                                            />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <span className="text-muted-foreground">No Image</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{getStatusBadge(item.kitStatus)}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditClick(item)}
                                                    title="Edit"
                                                    disabled={item.kitStatus.toLowerCase() === "invalid"}
                                                    className={item.kitStatus.toLowerCase() === "invalid" ? "opacity-50 cursor-not-allowed" : ""}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(item)}
                                                    title="Delete"
                                                    disabled={item.kitStatus.toLowerCase() === "invalid"}
                                                    className={item.kitStatus.toLowerCase() === "invalid" ? "text-red-500 opacity-50 cursor-not-allowed" : "text-red-500 hover:text-red-600"}
                                                >
                                                    <Trash className="h-4 w-4" />
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

                <CreateKit
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSuccess={handleActionSuccess}
                />
                {selectedKit && (
                    <DeleteKit
                        open={isDeleteDialogOpen}
                        onOpenChange={(open) => {
                            setIsDeleteDialogOpen(open)
                            if (!open) setSelectedKit(null)
                        }}
                        kitId={selectedKit.kitId}
                        kitName={selectedKit.kitName}
                        onDeleteSuccess={handleActionSuccess}
                    />
                )}
                {selectedKit && (
                    <EditKit
                        open={isEditDialogOpen}
                        onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (!open) setSelectedKit(null)
                        }}
                        kit={selectedKit}
                        onSuccess={handleActionSuccess}
                    />
                )}
            </div>
        </div>
    )
}