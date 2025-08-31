"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, Users } from "lucide-react"

// Mock data for lab booking requests
interface LabRequest {
    id: number
    lecturer: string
    email: string
    lab: string
    date: string
    timeSlot: string
    maxStudents: number
    description: string
    lecturerNotes: string
    status: "pending" | "approved" | "rejected"
    submittedAt: string
    course: string
    rejectionReason?: string
}

const mockRequests: LabRequest[] = [
    {
        id: 1,
        lecturer: "Dr. Nguyen Van A",
        email: "nguyenvana@university.edu",
        lab: "Computer Lab 1",
        date: "2024-01-15",
        timeSlot: "08:00 - 10:00",
        maxStudents: 30,
        description: "Programming fundamentals practice session",
        lecturerNotes: "Need computers with Visual Studio Code installed",
        status: "pending",
        submittedAt: "2024-01-10 14:30",
        course: "CS101 - Introduction to Programming",
    },
    {
        id: 2,
        lecturer: "Prof. Tran Thi B",
        email: "tranthib@university.edu",
        lab: "Physics Lab 2",
        date: "2024-01-16",
        timeSlot: "14:00 - 16:00",
        maxStudents: 25,
        description: "Quantum mechanics experiment",
        lecturerNotes: "Require oscilloscope and signal generators",
        status: "approved",
        submittedAt: "2024-01-08 09:15",
        course: "PHY301 - Advanced Physics",
    },
    {
        id: 3,
        lecturer: "Dr. Le Van C",
        email: "levanc@university.edu",
        lab: "Chemistry Lab 1",
        date: "2024-01-17",
        timeSlot: "10:00 - 12:00",
        maxStudents: 20,
        description: "Organic chemistry synthesis",
        lecturerNotes: "Safety equipment required for all students",
        status: "rejected",
        submittedAt: "2024-01-09 16:45",
        course: "CHEM201 - Organic Chemistry",
        rejectionReason: "Lab equipment maintenance scheduled for this time",
    },
    {
        id: 4,
        lecturer: "Dr. Pham Thi D",
        email: "phamthid@university.edu",
        lab: "Computer Lab 2",
        date: "2024-01-18",
        timeSlot: "13:00 - 15:00",
        maxStudents: 35,
        description: "Database design workshop",
        lecturerNotes: "MySQL and phpMyAdmin access needed",
        status: "pending",
        submittedAt: "2024-01-11 11:20",
        course: "CS201 - Database Systems",
    },
]

export default function LabRequestsPage() {
    const [requests, setRequests] = useState<LabRequest[]>(mockRequests)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null)

    const handleApprove = (id: number) => {
        setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req)))
    }

    const handleReject = (id: number) => {
        setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req)))
    }

    const filteredRequests = requests.filter((request) => {
        const matchesSearch =
            request.lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.lab.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.course.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || request.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: LabRequest["status"]) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "approved":
                return (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                    </Badge>
                )
            case "rejected":
                return (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const pendingCount = requests.filter((r) => r.status === "pending").length
    const approvedCount = requests.filter((r) => r.status === "approved").length
    const rejectedCount = requests.filter((r) => r.status === "rejected").length

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold text-balance">Lab Booking Requests</h1>
                <p className="text-muted-foreground">Review and manage lab booking requests from lecturers</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filter Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by lecturer, lab, or course..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Requests Table */}
            <Card>
                <CardHeader>
                    <CardDescription>
                        {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                                <TableHead>Lecturer</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{request.lecturer}</div>
                                            <div className="text-sm text-muted-foreground">{request.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{request.course}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{request.date}</div>
                                            <div className="text-sm text-muted-foreground">{request.timeSlot}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Users className="h-4 w-4 text-green-500" />
                                            {request.maxStudents}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {request.status === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(request.id)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
