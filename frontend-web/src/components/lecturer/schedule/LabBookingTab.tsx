"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FileText, Search, Filter } from "lucide-react"
import { Pagination } from "antd"
import { listRegistrationScheduleByTeacherId } from "@/services/registrationScheduleServices"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

interface LabBooking {
    registrationScheduleId: number
    labName: string
    className: string
    registrationScheduleDate: string
    slotName: string
    registrationScheduleNote: string
    registrationScheduleStatus: "Accept" | "Pending" | "Reject"
    teacherName: string
    slotStartTime: string
    slotEndTime: string
}

export default function LabBookingTab() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState<LabBooking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<LabBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const fetchBookings = async () => {
        const userId = user?.userId
        if (!userId) {
            setLoading(false)
            toast.error("User ID not found. Please log in again.")
            return
        }

        setLoading(true)
        try {
            const response = await listRegistrationScheduleByTeacherId(userId)
            if (response) {
                setBookings(response)
                setFilteredBookings(response)
            } else {
                toast.error("Failed to fetch lab bookings.")
            }
        } catch (error) {
            toast.error("An error occurred while fetching data.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [user])

    useEffect(() => {
        let filtered = bookings

        if (statusFilter !== "all") {
            filtered = filtered.filter((booking) => booking.registrationScheduleStatus === statusFilter)
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (booking) =>
                    booking.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.registrationScheduleNote?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        setFilteredBookings(filtered)
        setPageNum(1)
    }, [statusFilter, searchTerm, bookings])

    const getStatusBadge = (status: LabBooking["registrationScheduleStatus"]) => {
        switch (status) {
            case "Accept":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>
            case "Reject":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
            case "Pending":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const handlePaginationChange = (page: number, pageSize: number | undefined) => {
        setPageNum(page)
        setPageSize(pageSize || 10)
    }

    const paginatedBookings = filteredBookings.slice((pageNum - 1) * pageSize, pageNum * pageSize)

    return (
        <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-5">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by lab name, class, or note..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-full sm:w-48">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Accept">Accepted</SelectItem>
                                <SelectItem value="Reject">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading bookings...</p>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No booking requests found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                                        <TableHead className="font-semibold">Lab</TableHead>
                                        <TableHead className="font-semibold">Class</TableHead>
                                        <TableHead className="font-semibold">Schedule</TableHead>
                                        <TableHead className="font-semibold">Note</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedBookings.map((booking) => (
                                        <TableRow key={booking.registrationScheduleId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <TableCell>
                                                <p className="font-medium text-gray-900 dark:text-white">{booking.labName}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-gray-500">{booking.className}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div>
                                                        <p>{new Date(booking.registrationScheduleDate).toLocaleDateString()}</p>
                                                        <p className="text-gray-500">{booking.slotName} ({booking.slotStartTime}-{booking.slotEndTime})</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm max-w-xs truncate" title={booking.registrationScheduleNote || ''}>
                                                    {booking.registrationScheduleNote || 'N/A'}
                                                </p>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(booking.registrationScheduleStatus)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {filteredBookings.length > 0 && (
                <div className="flex justify-end mt-6">
                    <Pagination
                        current={pageNum}
                        pageSize={pageSize}
                        total={filteredBookings.length}
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                        onChange={handlePaginationChange}
                        showSizeChanger
                        onShowSizeChange={(current, size) => {
                            setPageNum(1)
                            setPageSize(size)
                        }}
                    />
                </div>
            )}
        </div>
    )
}