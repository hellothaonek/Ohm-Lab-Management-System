"use client"

import { useState } from "react"
import Link from "next/link"
import { CircuitBoard, Search, Plus, AlertTriangle, CheckCircle, Clock, Eye, Edit, Trash2, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// Define status options for the Select dropdown
const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
]

// Sample reports data for admin view
const reportsData = [
    {
        id: 1,
        title: "Oscilloscope Display Malfunction",
        description:
            "The display on oscilloscope #3 in Lab A-301 is flickering and sometimes goes completely blank during use.",
        equipmentType: "oscilloscope",
        serialNumber: "TEKTRO-OSC-2023-003",
        reportDate: "2025-05-15T09:30:00",
        status: "pending",
        updatedDate: "2025-05-15T09:30:00",
        reportedBy: "Dr. Nguyen Van A",
        labLocation: "Lab A-301",
        priority: "high",
        comments: [],
    },
    {
        id: 2,
        title: "Multimeter Not Reading Correctly",
        description:
            "The Fluke multimeter is showing inconsistent readings when measuring resistance. Tested against known resistors and found significant deviation.",
        equipmentType: "multimeter",
        serialNumber: "FLUKE-MM-2022-015",
        reportDate: "2025-05-10T14:20:00",
        status: "in_progress",
        updatedDate: "2025-05-12T11:15:00",
        reportedBy: "Lecturer Tran Thi B",
        labLocation: "Lab B-205",
        priority: "medium",
        comments: [
            {
                author: "Technical Staff",
                date: "2025-05-12T11:15:00",
                text: "Scheduled for inspection on May 14th. Will update after assessment.",
            },
        ],
    },
    {
        id: 3,
        title: "Power Supply Overheating",
        description:
            "The bench power supply in Lab B-205 is getting extremely hot after about 30 minutes of use, even at low current settings.",
        equipmentType: "power_supply",
        serialNumber: "KEYSIGHT-PS-2024-007",
        reportDate: "2025-05-08T10:45:00",
        status: "resolved",
        updatedDate: "2025-05-11T16:30:00",
        reportedBy: "Dr. Le Van C",
        labLocation: "Lab B-205",
        priority: "high",
        comments: [
            {
                author: "Technical Staff",
                date: "2025-05-09T09:20:00",
                text: "Inspected the unit. Found dust buildup blocking ventilation. Will clean and test.",
            },
            {
                author: "Technical Staff",
                date: "2025-05-11T16:30:00",
                text: "Cleaned internal components and tested for 2 hours. Temperature remains normal. Issue resolved.",
            },
        ],
    },
    {
        id: 4,
        title: "Function Generator Output Unstable",
        description:
            "The function generator in Lab C-102 has unstable output amplitude that varies randomly during experiments.",
        equipmentType: "function_generator",
        serialNumber: "RIGOL-FG-2023-012",
        reportDate: "2025-05-05T13:15:00",
        status: "resolved",
        updatedDate: "2025-05-07T10:00:00",
        reportedBy: "Lecturer Pham Thi D",
        labLocation: "Lab C-102",
        priority: "medium",
        comments: [
            {
                author: "Technical Staff",
                date: "2025-05-07T10:00:00",
                text: "Initial testing confirms the issue. Contacted manufacturer for troubleshooting steps.",
            },
        ],
    },
    {
        id: 5,
        title: "Soldering Station Not Heating",
        description:
            "The soldering station in Lab A-301 doesn't heat up. Power light comes on but temperature doesn't rise.",
        equipmentType: "soldering_station",
        serialNumber: "HAKKO-SS-2022-009",
        reportDate: "2025-05-01T15:30:00",
        status: "resolved",
        updatedDate: "2025-05-03T14:45:00",
        reportedBy: "Dr. Hoang Van E",
        labLocation: "Lab A-301",
        priority: "low",
        comments: [
            {
                author: "Technical Staff",
                date: "2025-05-02T09:10:00",
                text: "Inspected unit. Found loose connection in heating element.",
            },
            {
                author: "Technical Staff",
                date: "2025-05-03T14:45:00",
                text: "Repaired connection and tested. Working properly now.",
            },
        ],
    },
    {
        id: 6,
        title: "Computer Blue Screen Error",
        description: "Computer #5 in Lab D-101 frequently shows blue screen errors during programming labs.",
        equipmentType: "computer",
        serialNumber: "DELL-PC-2023-025",
        reportDate: "2025-04-28T11:20:00",
        status: "pending",
        updatedDate: "2025-04-28T11:20:00",
        reportedBy: "Lecturer Vu Thi F",
        labLocation: "Lab D-101",
        priority: "high",
        comments: [],
    },
]

export default function AdminReportsPage() {
    const [activeTab, setActiveTab] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [priorityFilter, setPriorityFilter] = useState("all")

    const handleViewReport = (report: any) => {
        setSelectedReport(report)
        setIsViewDialogOpen(true)
    }

    const filteredReports = reportsData.filter((report) => {
        const matchesSearch =
            report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.labLocation.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = activeTab === "all" || report.status === activeTab
        const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter

        return matchesSearch && matchesStatus && matchesPriority
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                    </Badge>
                )
            case "in_progress":
                return (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        In Progress
                    </Badge>
                )
            case "resolved":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Resolved
                    </Badge>
                )
            default:
                return <Badge variant="secondary">Unknown</Badge>
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                        High
                    </Badge>
                )
            case "medium":
                return (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                        Medium
                    </Badge>
                )
            case "low":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Low
                    </Badge>
                )
            default:
                return <Badge variant="secondary">Unknown</Badge>
        }
    }

    const getEquipmentTypeLabel = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
    }

    return (
        <div className="min-h-screen p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipment Reports Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor and manage all equipment reports from lecturers and staff
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/dashboard">
                                <CircuitBoard className="h-4 w-4 mr-2" />
                                Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search reports by title, serial number, reporter, or lab location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-48">
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="high">High Priority</SelectItem>
                                    <SelectItem value="medium">Medium Priority</SelectItem>
                                    <SelectItem value="low">Low Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs and Reports List */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                    <TabsTrigger value="all">All Reports</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Lab Location</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Report Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">{report.title}</TableCell>
                                                <TableCell>{getEquipmentTypeLabel(report.equipmentType)}</TableCell>
                                                <TableCell>{report.reportedBy}</TableCell>
                                                <TableCell>{report.labLocation}</TableCell>
                                                <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                                                <TableCell>{getStatusBadge(report.status)}</TableCell>
                                                <TableCell>{new Date(report.reportDate).toLocaleDateString("vi-VN")}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => handleViewReport(report)}>
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="pending" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Lab Location</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Report Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No pending reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">{report.title}</TableCell>
                                                <TableCell>{getEquipmentTypeLabel(report.equipmentType)}</TableCell>
                                                <TableCell>{report.reportedBy}</TableCell>
                                                <TableCell>{report.labLocation}</TableCell>
                                                <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                                                <TableCell>{new Date(report.reportDate).toLocaleDateString("vi-VN")}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => handleViewReport(report)}>
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="in_progress" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Lab Location</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Last Update</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No in-progress reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">{report.title}</TableCell>
                                                <TableCell>{getEquipmentTypeLabel(report.equipmentType)}</TableCell>
                                                <TableCell>{report.reportedBy}</TableCell>
                                                <TableCell>{report.labLocation}</TableCell>
                                                <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                                                <TableCell>{new Date(report.updatedDate).toLocaleDateString("vi-VN")}</TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="ghost" onClick={() => handleViewReport(report)}>
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
                </TabsContent>
                <TabsContent value="resolved" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Lab Location</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Report Date</TableHead>
                                        <TableHead>Resolved Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No resolved reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">{report.title}</TableCell>
                                                <TableCell>{getEquipmentTypeLabel(report.equipmentType)}</TableCell>
                                                <TableCell>{report.reportedBy}</TableCell>
                                                <TableCell>{report.labLocation}</TableCell>
                                                <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                                                <TableCell>{new Date(report.reportDate).toLocaleDateString("vi-VN")}</TableCell>
                                                <TableCell>{new Date(report.updatedDate).toLocaleDateString("vi-VN")}</TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="ghost" onClick={() => handleViewReport(report)}>
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
                </TabsContent>
            </Tabs>

            {/* View Report Dialog */}
            {selectedReport && (
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>{selectedReport.title}</DialogTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getStatusBadge(selectedReport.status)}
                                {getPriorityBadge(selectedReport.priority)}
                                <span>Reported on {new Date(selectedReport.reportDate).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Equipment Type</h4>
                                    <p className="text-gray-900 dark:text-white">{getEquipmentTypeLabel(selectedReport.equipmentType)}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number</h4>
                                    <p className="text-gray-900 dark:text-white font-mono">{selectedReport.serialNumber}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reported By</h4>
                                    <p className="text-gray-900 dark:text-white">{selectedReport.reportedBy}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lab Location</h4>
                                    <p className="text-gray-900 dark:text-white">{selectedReport.labLocation}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h4>
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-gray-900 dark:text-white">
                                    {selectedReport.description}
                                </div>
                            </div>

                            {selectedReport.comments.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Updates & Comments</h4>
                                    <div className="space-y-3">
                                        {selectedReport.comments.map((comment: any, index: number) => (
                                            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(comment.date).toLocaleString("vi-VN")}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
