"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Users, FileText, Eye, Search, Filter } from "lucide-react"
import { Pagination } from "antd"

interface LabBooking {
    bookingId: number
    labName: string
    className: string
    scheduledDate: string
    slotName: string
    scheduleDescription: string
    maxStudentsPerSession: number
    lecturerNotes: string
    status: "pending" | "accepted" | "rejected"
    submittedDate: string
    reviewedBy?: string
    reviewedDate?: string
    reviewNotes?: string
}

// Mock data - replace with actual API call
const mockBookings: LabBooking[] = [
    {
        bookingId: 1,
        labName: "Computer Network Lab",
        className: "SE1234",
        scheduledDate: "2024-01-15",
        slotName: "Slot 1 (7:30-9:00)",
        scheduleDescription: "Network Configuration Practice",
        maxStudentsPerSession: 30,
        lecturerNotes: "Students need to bring laptops",
        status: "accepted",
        submittedDate: "2024-01-10",
        reviewedBy: "Dr. Nguyen Van A",
        reviewedDate: "2024-01-12",
        reviewNotes: "Approved for network lab session",
    },
    {
        bookingId: 2,
        labName: "Software Engineering Lab",
        className: "SE1235",
        scheduledDate: "2024-01-20",
        slotName: "Slot 3 (13:00-14:30)",
        scheduleDescription: "Agile Development Workshop",
        maxStudentsPerSession: 25,
        lecturerNotes: "Focus on Scrum methodology",
        status: "pending",
        submittedDate: "2024-01-18",
    },
    {
        bookingId: 3,
        labName: "Database Lab",
        className: "SE1236",
        scheduledDate: "2024-01-12",
        slotName: "Slot 2 (9:15-10:45)",
        scheduleDescription: "SQL Query Optimization",
        maxStudentsPerSession: 28,
        lecturerNotes: "Advanced SQL techniques",
        status: "rejected",
        submittedDate: "2024-01-08",
        reviewedBy: "Dr. Tran Thi B",
        reviewedDate: "2024-01-10",
        reviewNotes: "Lab equipment maintenance scheduled for this date",
    },
]

export default function LabBookingTab() {
    const [bookings, setBookings] = useState<LabBooking[]>(mockBookings)
    const [filteredBookings, setFilteredBookings] = useState<LabBooking[]>(mockBookings)
    const [loading, setLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedBooking, setSelectedBooking] = useState<LabBooking | null>(null)
    const [showDetail, setShowDetail] = useState(false)

    useEffect(() => {
        let filtered = bookings

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((booking) => booking.status === statusFilter)
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (booking) =>
                    booking.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.scheduleDescription.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        setFilteredBookings(filtered)
        setPageNum(1)
    }, [statusFilter, searchTerm, bookings])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>
            case "rejected":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
            case "pending":
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
            <div className="mb-6">
                <h2 className="text-xl font-bold">Lab Booking History</h2>
                <p>Track the status of lab booking requests here.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-5">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by lab name, class, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="w-full sm:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
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
                                        <TableHead className="font-semibold">Lab & Class</TableHead>
                                        <TableHead className="font-semibold">Schedule</TableHead>
                                        <TableHead className="font-semibold">Description</TableHead>
                                        <TableHead className="font-semibold">Students</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Submitted</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedBookings.map((booking) => (
                                        <TableRow key={booking.bookingId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{booking.labName}</p>
                                                    <p className="text-sm text-gray-500">{booking.className}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div>
                                                        <p>{booking.scheduledDate}</p>
                                                        <p className="text-gray-500">{booking.slotName}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm max-w-xs truncate" title={booking.scheduleDescription}>
                                                    {booking.scheduleDescription}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Users className="h-4 w-4 text-green-500" />
                                                    {booking.maxStudentsPerSession}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Clock className="h-4 w-4" />
                                                    {booking.submittedDate}
                                                </div>
                                            </TableCell>
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

            {/* Booking Detail Modal */}
            {showDetail && selectedBooking && (
                <BookingDetailModal booking={selectedBooking} open={showDetail} onClose={() => setShowDetail(false)} />
            )}
        </div>
    )
}

// Booking Detail Modal Component
interface BookingDetailModalProps {
    booking: LabBooking
    open: boolean
    onClose: () => void
}

function BookingDetailModal({ booking, open, onClose }: BookingDetailModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Details</h2>
                        <Button variant="outline" onClick={onClose}>
                            ×
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Lab Name</label>
                                <p className="text-lg font-semibold">{booking.labName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Class</label>
                                <p className="text-lg font-semibold">{booking.className}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                                <p className="text-lg">{booking.scheduledDate}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Time Slot</label>
                                <p className="text-lg">{booking.slotName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Max Students</label>
                                <p className="text-lg">{booking.maxStudentsPerSession}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="mt-1">
                                    {booking.status === "accepted" && <Badge className="bg-green-100 text-green-800">Accepted</Badge>}
                                    {booking.status === "rejected" && <Badge className="bg-red-100 text-red-800">Rejected</Badge>}
                                    {booking.status === "pending" && <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="text-lg mt-1">{booking.scheduleDescription}</p>
                        </div>

                        {booking.lecturerNotes && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Lecturer Notes</label>
                                <p className="text-lg mt-1">{booking.lecturerNotes}</p>
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-3">Review Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Submitted Date</label>
                                    <p>{booking.submittedDate}</p>
                                </div>
                                {booking.reviewedDate && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Reviewed Date</label>
                                        <p>{booking.reviewedDate}</p>
                                    </div>
                                )}
                                {booking.reviewedBy && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Reviewed By</label>
                                        <p>{booking.reviewedBy}</p>
                                    </div>
                                )}
                            </div>
                            {booking.reviewNotes && (
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-500">Review Notes</label>
                                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{booking.reviewNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}