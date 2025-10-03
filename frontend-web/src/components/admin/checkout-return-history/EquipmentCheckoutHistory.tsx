"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from 'antd'
import { useClientOnly } from "@/hooks/useClientOnly"
import { searchTeamEquipment } from "@/services/teamEquipmentServices"

// Interface for API response item
interface ApiResponseItem {
    teamEquipmentId: number
    teamId: number
    teamName: string
    classId: number
    className: string
    equipmentId: string
    equipmentName: string
    equipmentCode: string
    equipmentNumberSerial: string
    teamEquipmentName: string
    teamEquipmentDescription: string
    teamEquipmentDateBorrow: string
    teamEquipmentDateGiveBack: string | null
    teamEquipmentStatus: "Paid" | "AreBorrowing"
}

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Paid", label: "Returned" },
    { value: "AreBorrowing", label: "Borrowing" },
]

export default function EquipmentCheckoutHistory() {
    // States for Search/Filter
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")

    // States for Original Data
    const [fullHistoryData, setFullHistoryData] = useState<ApiResponseItem[]>([])

    // States for Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    // Other States
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const hasMounted = useClientOnly()

    const fetchHistoryData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await searchTeamEquipment({
                pageNum: 1,
                pageSize: 9999,
                keyWord: "",
            })
            if (response.pageData) {
                setFullHistoryData(response.pageData)
            } else {
                setError("Failed to load history data")
                setFullHistoryData([])
            }
        } catch (err) {
            setError("An error occurred while loading data")
            setFullHistoryData([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchHistoryData()
    }, [fetchHistoryData])

    // Filter & Pagination Logic
    const displayedHistoryData = useMemo(() => {
        let filteredItems = fullHistoryData

        // Step 1: Filter by Status
        if (selectedStatus !== "all") {
            filteredItems = filteredItems.filter(item => item.teamEquipmentStatus === selectedStatus)
        }

        // Step 2: Filter by Search Term
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase().trim()
            filteredItems = filteredItems.filter(item =>
                item.equipmentName.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.equipmentCode.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.teamName.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.teamEquipmentName.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.className.toLowerCase().includes(lowerCaseSearchTerm)
            )
        }

        // Update total items after filtering
        setTotalItems(filteredItems.length)

        // Step 3: Apply Pagination
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize

        return filteredItems.slice(startIndex, endIndex)
    }, [fullHistoryData, searchTerm, selectedStatus, currentPage, pageSize])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status)
        setCurrentPage(1)
    }

    const handlePaginationChange = (page: number, size?: number) => {
        setCurrentPage(page)
        if (size !== undefined) {
            setPageSize(size)
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Paid":
                return "default"
            case "AreBorrowing":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "Paid":
                return "Returned"
            case "AreBorrowing":
                return "Borrowing"
            default:
                return status
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("en-US")
    }

    // Check if there are filtered results
    const hasFilteredResults = useMemo(() => {
        let filteredItems = fullHistoryData;

        // Filter by Status
        if (selectedStatus !== "all") {
            filteredItems = filteredItems.filter(item => item.teamEquipmentStatus === selectedStatus)
        }

        // Filter by Search Term
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase().trim()
            filteredItems = filteredItems.filter(item =>
                item.equipmentName.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.equipmentCode.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.teamName.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.teamEquipmentName.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.className.toLowerCase().includes(lowerCaseSearchTerm)
            )
        }
        return filteredItems.length;
    }, [fullHistoryData, searchTerm, selectedStatus])

    // Render table view
    const renderTableView = () => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Equipment Name</TableHead>
                            <TableHead>Equipment Code</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Borrow Date</TableHead>
                            <TableHead>Return Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4 text-red-500">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : displayedHistoryData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    No history data found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayedHistoryData.map((history) => (
                                <TableRow key={history.teamEquipmentId}>
                                    <TableCell className="font-medium">{history.equipmentName}</TableCell>
                                    <TableCell className="text-orange-500">{history.equipmentCode}</TableCell>
                                    <TableCell>{history.teamName}</TableCell>
                                    <TableCell>{history.className}</TableCell>
                                    <TableCell>{formatDate(history.teamEquipmentDateBorrow)}</TableCell>
                                    <TableCell>{formatDate(history.teamEquipmentDateGiveBack)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(history.teamEquipmentStatus)} className="flex items-center gap-1 w-fit">
                                            {getStatusLabel(history.teamEquipmentStatus)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )

    if (!hasMounted) {
        return (
            <div className="min-h-screen p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by equipment name, code, borrower, team, or class..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
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
            </div>

            {hasFilteredResults === 0 && !isLoading && !error ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Equipment History Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search criteria.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                renderTableView()
            )}

            {!isLoading && totalItems > 0 && (
                <div className="flex justify-end mt-6">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalItems}
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                        onChange={handlePaginationChange}
                        showSizeChanger
                        onShowSizeChange={(current, size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            )}
        </div>
    )
}