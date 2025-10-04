"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Pencil, Trash2, Plus, Eye, Search } from "lucide-react"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Pagination } from "antd"
import { getLabBySubjectId } from "@/services/labServices"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LabDetail from "@/components/head/lab/LabDetail"
import EditLab from "@/components/head/lab/EditLab"
import DeleteLab from "@/components/head/lab/DeleteLab"
import CreateLab from "@/components/head/lab/CreateLab"

// Type interfaces remain the same
interface Equipment {
    equipmentTypeId: string
    equipmentTypeName: string
}

interface Kit {
    kitTemplateId: string
    kitTemplateName: string
}

interface Lab {
    labId: number
    subjectId: number
    labName: string
    labRequest: string
    labTarget: string
    labStatus: string
    requiredEquipments: {
        equipmentTypeId: string
        equipmentTypeName?: string
    }[]
    requiredKits: {
        kitTemplateId: string
        kitTemplateName?: string
    }[]
}

export default function CourseDetailPage() {
    const searchParams = useSearchParams()
    const subjectIdParam = searchParams.get("subjectId")
    const subjectId = subjectIdParam ? parseInt(subjectIdParam) : null

    // State variables
    const [allLabs, setAllLabs] = useState<Lab[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(6)
    const [totalItems, setTotalItems] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    // Modal states
    const [selectedLabId, setSelectedLabId] = useState<number | null>(null)
    const [openDetail, setOpenDetail] = useState(false)
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null)
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [openCreate, setOpenCreate] = useState(false)

    // Function to fetch labs from the API
    const fetchLabs = useCallback(async () => {
        if (!subjectId) {
            setError("No subject ID provided")
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            const response = await getLabBySubjectId(subjectId.toString())
            if (response) {
                setAllLabs(response.pageData)
                setTotalItems(response.pageData.length)
                if (pageNum > Math.ceil(response.pageData.length / pageSize) && response.pageData.length > 0) {
                    setPageNum(1)
                }
            } else {
                throw new Error(response?.message || "Failed to fetch labs")
            }
        } catch (err: any) {
            const errorMessage = err.message || "Failed to fetch labs"
            setError(errorMessage)
            console.error("Error fetching labs:", err)
            setAllLabs([])
        } finally {
            setIsLoading(false)
        }
    }, [subjectId, pageSize])

    useEffect(() => {
        fetchLabs()
    }, [fetchLabs])

    // Client-side filtering and pagination logic
    const filteredLabs = useMemo(() => {
        let filtered = allLabs
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(lab =>
                lab.labName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(lab =>
                lab.labStatus.toLowerCase() === statusFilter.toLowerCase()
            )
        }
        return filtered
    }, [allLabs, searchQuery, statusFilter])

    const displayedLabs = useMemo(() => {
        const startIndex = (pageNum - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredLabs.slice(startIndex, endIndex)
    }, [filteredLabs, pageNum, pageSize])

    // Update total items for pagination
    useEffect(() => {
        setTotalItems(filteredLabs.length)
        // Reset to first page when filters change
        setPageNum(1)
    }, [filteredLabs])

    // Handler for pagination change
    const handlePaginationChange = (page: number, newPageSize: number | undefined) => {
        setPageNum(page)
        setPageSize(newPageSize || 6)
    }

    // Handler for search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    // Handler for status filter
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
    }

    // New handler for View action
    const handleViewLab = (labId: number) => {
        setSelectedLabId(labId)
        setOpenDetail(true)
    }

    // Handlers for Modals
    const handleEditLab = (lab: Lab) => {
        setSelectedLab(lab)
        setOpenEdit(true)
    }

    const handleEditClose = () => {
        setOpenEdit(false)
        setSelectedLab(null)
    }

    const handleEditUpdate = () => {
        fetchLabs()
        handleEditClose()
    }

    const handleDeleteLab = (lab: Lab) => {
        setSelectedLab(lab)
        setOpenDelete(true)
    }

    const handleDeleteClose = () => {
        setOpenDelete(false)
        setSelectedLab(null)
    }

    const handleDeleteSuccess = () => {
        fetchLabs()
        handleDeleteClose()
    }

    const handleLabCreated = (newLab: Lab) => {
        fetchLabs()
        setOpenCreate(false)
    }

    // Function to determine badge variant based on lab status
    const getBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return <Badge className="bg-green-500">Active</Badge>
            case "inactive":
                return <Badge className="bg-red-500">Inactive</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
           <h1 className="text-3xl font-bold">Lab Sessions</h1>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                            placeholder="Search labs..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-8 w-full"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setOpenCreate(true)}
                    disabled={!subjectId}
                >
                    Create Lab
                </Button>
            </div>
            <div>
                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
                        <p>Loading labs...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 font-medium">
                        <p>{error}</p>
                    </div>
                ) : filteredLabs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No labs found for this course.</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-blue-50">
                                    <TableRow>
                                        <TableHead className="w-[40%]">Lab Name</TableHead>
                                        <TableHead className="w-[30%]">Status</TableHead>
                                        <TableHead className="w-[30%] text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayedLabs.map((lab) => (
                                        <TableRow
                                            key={lab.labId}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <TableCell className="font-medium text-blue-500">{lab.labName}</TableCell>
                                            <TableCell>
                                                {getBadgeVariant(lab.labStatus)}
                                            </TableCell>
                                            <TableCell className="flex justify-center space-x-4">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleViewLab(lab.labId)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditLab(lab)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDeleteLab(lab)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end mt-8">
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
                    </>
                )}
            </div>

            <LabDetail
                labId={selectedLabId}
                open={openDetail}
                onClose={() => setOpenDetail(false)}
            />

            <EditLab
                lab={selectedLab}
                open={openEdit}
                onClose={handleEditClose}
                onUpdate={handleEditUpdate}
            />

            <DeleteLab
                lab={selectedLab}
                open={openDelete}
                onClose={handleDeleteClose}
                onDelete={handleDeleteSuccess}
            />

            {subjectId !== null && (
                <CreateLab
                    subjectId={subjectId}
                    isOpen={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onLabCreated={handleLabCreated}
                />
            )}
        </div>
    )
}