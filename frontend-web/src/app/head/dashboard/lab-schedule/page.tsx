"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Pagination } from "antd"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AcceptBooking } from "@/components/lecturer/lab/AcceptBooking"
import { RejectBooking } from "@/components/lecturer/lab/RejectBooking"
import { DeleteBooking } from "@/components/lecturer/lab/DeleteBooking"
import { searchRegistrationSchedule } from "@/services/registrationScheduleServices"

interface LabBooking {
    registrationScheduleId: number
    labName: string
    className: string
    registrationScheduleDate: string
    slotName: string
    registrationScheduleNote: string | null
    registrationScheduleStatus: "Accept" | "Pending" | "Reject"
    teacherName: string
    slotStartTime: string
    slotEndTime: string
    registrationScheduleCreateDate: string
}

interface PageInfo {
    page: number
    size: number
    totalPage: number
    totalItem: number
}

export default function RequestLabSchedule() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState<LabBooking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<LabBooking[]>([])
    const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, size: 10, totalPage: 1, totalItem: 0 })
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"Pending" | "Accept" | "Reject">("Pending")
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchBookings = async () => {
        const userId = user?.userId
        if (!userId) {
            setLoading(false)
            toast.error("User ID not found. Please log in again.")
            return
        }

        setLoading(true)
        try {
            const response = await searchRegistrationSchedule({
                pageNum,
                pageSize,
                keyWord: "",
                status: "",
            })
            if (response) {
                setBookings(response.pageData)
                setPageInfo(response.pageInfo)
            } else {
                toast.error("Failed to fetch lab booking requests.")
            }
        } catch (error) {
            toast.error("An error occurred while fetching data.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [user, pageNum, pageSize])

    useEffect(() => {
        const filtered = bookings
            .filter(booking => booking.registrationScheduleStatus === activeTab)
            .filter(booking =>
                booking.labName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        setFilteredBookings(filtered)
        setPageInfo(prev => ({
            ...prev,
            totalItem: filtered.length,
            totalPage: Math.ceil(filtered.length / pageSize)
        }))
        setPageNum(1)
    }, [activeTab, bookings, pageSize, searchQuery])

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

    return (
        <div className="mt-4">
            <div className="mb-6">
                <h2 className="text-xl font-bold">Lab Booking Requests</h2>
                <p>Review and manage lab booking requests as Head of Department.</p>
            </div>

            <Tabs defaultValue="Pending" onValueChange={(value) => setActiveTab(value as "Pending" | "Accept" | "Reject")} className="ml-auto mb-5">
                <TabsList>
                    <TabsTrigger value="Pending">Pending</TabsTrigger>
                    <TabsTrigger value="Accept">Accepted</TabsTrigger>
                    <TabsTrigger value="Reject">Rejected</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by lab, class, or teacher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading booking requests...</p>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No booking requests found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                                        <TableHead className="font-semibold">Lab</TableHead>
                                        <TableHead className="font-semibold">Class</TableHead>
                                        <TableHead className="font-semibold">Teacher</TableHead>
                                        <TableHead className="font-semibold">Schedule</TableHead>
                                        <TableHead className="font-semibold">Created At</TableHead>
                                        <TableHead className="font-semibold">Note</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBookings.map((booking) => (
                                        <TableRow key={booking.registrationScheduleId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <TableCell>
                                                <p className="font-medium text-gray-900 dark:text-white">{booking.labName}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-gray-500">{booking.className}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-gray-500">{booking.teacherName}</p>
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
                                                <p className="text-sm text-gray-500">
                                                    {new Date(booking.registrationScheduleCreateDate).toLocaleString()}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm max-w-xs truncate" title={booking.registrationScheduleNote || ''}>
                                                    {booking.registrationScheduleNote || 'N/A'}
                                                </p>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(booking.registrationScheduleStatus)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {booking.registrationScheduleStatus === "Pending" && (
                                                        <>
                                                            <AcceptBooking
                                                                registrationScheduleId={booking.registrationScheduleId}
                                                                registrationScheduleNote={booking.registrationScheduleNote}
                                                                onAcceptSuccess={fetchBookings}
                                                            />
                                                            <RejectBooking
                                                                registrationScheduleId={booking.registrationScheduleId}
                                                                onRejectSuccess={fetchBookings}
                                                            />
                                                        </>
                                                    )}
                                                    {(booking.registrationScheduleStatus === "Accept" || booking.registrationScheduleStatus === "Reject") && (
                                                        <DeleteBooking
                                                            registrationScheduleId={booking.registrationScheduleId}
                                                            onDeleteSuccess={fetchBookings}
                                                        />
                                                    )}
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
                        total={pageInfo.totalItem}
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