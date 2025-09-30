"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AcceptBooking } from "@/components/lecturer/lab/AcceptBooking"
import { RejectBooking } from "@/components/lecturer/lab/RejectBooking"
import { DeleteBooking } from "@/components/lecturer/lab/DeleteBooking"
import { searchRegistrationSchedule } from "@/services/registrationScheduleServices"
import { Pagination } from 'antd'

type BookingStatus = "All" | "Pending" | "Accept" | "Reject"

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
    const [allBookings, setAllBookings] = useState<LabBooking[]>([])
    const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, size: 10, totalPage: 1, totalItem: 0 })
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<BookingStatus>("All")
    const [searchQuery, setSearchQuery] = useState("")

    const { page: pageNum, size: pageSize } = pageInfo

    const fetchAllBookings = useCallback(async () => {
        const userId = user?.userId
        if (!userId) {
            setLoading(false)
            toast.error("User ID not found. Please log in again.")
            return
        }

        setLoading(true)
        try {
            const response = await searchRegistrationSchedule({
                pageNum: 1,
                pageSize: 1000,
                keyWord: "",
                status: "",
            })

            if (response) {
                setAllBookings(response.pageData)
                setPageInfo(prev => ({
                    ...prev,
                    totalItem: (response.pageData).length
                }))
            } else {
                toast.error("Failed to fetch lab booking requests.")
                setAllBookings([])
            }
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error("An error occurred while fetching data.")
            setAllBookings([])
        } finally {
            setLoading(false)
        }
    }, [user?.userId])

    useEffect(() => {
        if (user?.userId) {
            fetchAllBookings()
        }
    }, [fetchAllBookings, user?.userId])

    const filteredAndSearchedBookings = useMemo(() => {
        let filtered = allBookings.filter(booking => {
            if (activeTab === "All") return true
            return booking.registrationScheduleStatus === activeTab
        })

        const search = searchQuery.toLowerCase().trim()
        if (search) {
            filtered = filtered.filter(booking =>
                booking.labName.toLowerCase().includes(search) ||
                booking.className.toLowerCase().includes(search) ||
                booking.teacherName.toLowerCase().includes(search)
            )
        }

        setPageInfo(prev => {
            const newTotalItem = filtered.length;
            const newTotalPage = Math.ceil(newTotalItem / prev.size)
            const newPage = (prev.page > newTotalPage && newTotalPage > 0) ? 1 : prev.page;

            return {
                ...prev,
                page: prev.totalItem !== newTotalItem ? 1 : newPage,
                totalItem: newTotalItem,
            };
        });

        return filtered
    }, [allBookings, activeTab, searchQuery])

    const startIndex = (pageNum - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentBookings = filteredAndSearchedBookings.slice(startIndex, endIndex)

    const { totalItem } = pageInfo

    const handleTabChange = (value: string) => {
        setActiveTab(value as BookingStatus)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setPageInfo(prev => ({
            ...prev,
            page: page,
            size: newPageSize
        }))
    }

    const handleActionSuccess = () => {
        fetchAllBookings()
    }

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

    return (
        <div className="mt-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Lab Booking Requests</h1>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="ml-auto mb-5"
            >
                <TabsList>
                    <TabsTrigger value="All">All</TabsTrigger>
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
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading && allBookings.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading all booking requests...</p>
                        </div>
                    ) : currentBookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No booking requests found in the **{activeTab}** status matching the search.</p>
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
                                    {currentBookings.map((booking) => (
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
                                                                onAcceptSuccess={handleActionSuccess}
                                                            />
                                                            <RejectBooking
                                                                registrationScheduleId={booking.registrationScheduleId}
                                                                onRejectSuccess={handleActionSuccess}
                                                            />
                                                        </>
                                                    )}
                                                    {(booking.registrationScheduleStatus === "Accept" || booking.registrationScheduleStatus === "Reject") && (
                                                        <DeleteBooking
                                                            registrationScheduleId={booking.registrationScheduleId}
                                                            onDeleteSuccess={handleActionSuccess}
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

            {!loading && totalItem > 0 && (
                <div className="flex justify-end p-4">
                    <Pagination
                        current={pageNum}
                        pageSize={pageSize}
                        total={totalItem}
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                        onChange={handlePaginationChange}
                        onShowSizeChange={handlePaginationChange}
                        showSizeChanger
                        pageSizeOptions={['10', '20', '50']}
                    />
                </div>
            )}
        </div>
    )
}