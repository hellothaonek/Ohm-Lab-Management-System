"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Calendar, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
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

export default function CheckoutReturnHistory() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [historyData, setHistoryData] = useState<ApiResponseItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<ApiResponseItem | null>(null)
    const hasMounted = useClientOnly()

    // Fetch data from API
    useEffect(() => {
        const fetchHistoryData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await searchTeamEquipment({
                    pageNum: 1,
                    pageSize: 10,
                    keyWord: searchTerm,
                })
                if (response.pageData) {
                    setHistoryData(response.pageData)
                } else {
                    setError("Failed to load history data")
                }
            } catch (err) {
                setError("An error occurred while loading data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchHistoryData()
    }, [searchTerm])

    const filteredHistoryData = useMemo(() => {
        return historyData.filter(item => {
            const matchesSearch =
                searchTerm === "" ||
                item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.teamEquipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.className.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = selectedStatus === "all" || item.teamEquipmentStatus === selectedStatus

            return matchesSearch && matchesStatus
        })
    }, [historyData, searchTerm, selectedStatus])

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

    const handleViewDetail = (item: ApiResponseItem) => {
        setSelectedItem(item)
        setIsDetailModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsDetailModalOpen(false)
        setSelectedItem(null)
    }

    const renderTableView = () => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Equipment Name</TableHead>
                            <TableHead>Equipment Code</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Borrow Date</TableHead>
                            <TableHead>Return Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-4">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-4 text-red-500">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : filteredHistoryData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-4">
                                    No history data found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredHistoryData.map((history) => (
                                <TableRow key={history.teamEquipmentId}>
                                    <TableCell className="font-medium">
                                        <button
                                            onClick={() => handleViewDetail(history)}
                                            className="text-left hover:text-orange-600 hover:underline transition-colors"
                                        >
                                            {history.equipmentName}
                                        </button>
                                    </TableCell>
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
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleViewDetail(history)}
                                            title="View Details"
                                        >
                                            <Eye className="h-3 w-3" />
                                        </Button>
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
        <div className="min-h-screen p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipment Checkout/Return History</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by equipment name, code, borrower, team, or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
            <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredHistoryData.length} of {historyData.length} history records
                </p>
            </div>
            {filteredHistoryData.length === 0 && !isLoading && !error ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No History Data Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search criteria.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                renderTableView()
            )}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Checkout Details</DialogTitle>
                        <DialogClose onClick={handleCloseModal} />
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Equipment Name</h4>
                                <p className="text-gray-600 dark:text-gray-400">{selectedItem.equipmentName}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Equipment Code</h4>
                                <p className="text-gray-600 dark:text-gray-400">{selectedItem.equipmentCode}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Serial Number</h4>
                                <p className="text-gray-600 dark:text-gray-400">{selectedItem.equipmentNumberSerial}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Team</h4>
                                <p className="text-gray-600 dark:text-gray-400">{selectedItem.teamName}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Class</h4>
                                <p className="text-gray-600 dark:text-gray-400">{selectedItem.className}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Borrow Date</h4>
                                <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedItem.teamEquipmentDateBorrow)}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Return Date</h4>
                                <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedItem.teamEquipmentDateGiveBack)}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Status</h4>
                                <Badge variant={getStatusVariant(selectedItem.teamEquipmentStatus)}>
                                    {getStatusLabel(selectedItem.teamEquipmentStatus)}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Description</h4>
                                <p className="text-gray-600 dark:text-gray-400">{selectedItem.teamEquipmentDescription || "No description available"}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}