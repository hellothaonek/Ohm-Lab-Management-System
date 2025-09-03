"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CircuitBoard, Search, AlertTriangle, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dialog"
import { getAllReports, getReportDetailById } from "@/services/reportServices"
import { toast } from "react-toastify"

// Define Report interface inline
interface Report {
    reportId: number;
    userId: string;
    userName: string;
    scheduleId: number;
    scheduleName: string;
    reportTitle: string;
    reportDescription: string;
    reportCreateDate: string;
    reportStatus: string;
    resolutionNotes: string | null;
}

export default function HeadReportsPage() {
    const [activeTab, setActiveTab] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getAllReports()

            
            // Check if response has the expected structure
            if (response && response.reports) {
                setReports(response.reports)
            } else {
                setError("Invalid response format from server")
                setReports([])
            }
        } catch (err) {
            setError("An error occurred while fetching reports")
            setReports([])
            console.error("Error fetching reports:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleViewReport = async (report: Report) => {
        try {
            const response = await getReportDetailById(report.reportId.toString())

            
            // Check if response has the expected structure
            if (response && response.reportId) {
                setSelectedReport(response)
                setIsViewDialogOpen(true)
            } else {
                toast.error("Failed to fetch report details")
            }
        } catch (err) {
            toast.error("Failed to fetch report details")
            console.error("Error fetching report details:", err)
        }
    }



    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            report.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.scheduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportDescription.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = activeTab === "all" || report.reportStatus === activeTab

        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Pending":
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                    </Badge>
                )
            case "In Progress":
                return (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        In Progress
                    </Badge>
                )
            case "Resolved":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Resolved
                    </Badge>
                )
            case "Rejected":
                return (
                    <Badge variant="destructive">
                        Rejected
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN")
    }

    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading reports...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading reports</h3>
                        <p className="text-gray-600 dark:text-gray-400">{error}</p>
                        <Button onClick={fetchReports} className="mt-4">Try Again</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor and manage all reports from students and lecturers
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/head/dashboard">
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
                                    placeholder="Search reports by title, user name, schedule, or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs and Reports List */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                    <TabsTrigger value="all">All Reports</TabsTrigger>
                    <TabsTrigger value="Pending">Pending</TabsTrigger>
                    <TabsTrigger value="In Progress">In Progress</TabsTrigger>
                    <TabsTrigger value="Resolved">Resolved</TabsTrigger>
                    <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Report Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.reportId}>
                                                <TableCell className="font-medium">{report.reportTitle}</TableCell>
                                                <TableCell>{report.userName}</TableCell>
                                                <TableCell>{report.scheduleName}</TableCell>
                                                <TableCell>{getStatusBadge(report.reportStatus)}</TableCell>
                                                <TableCell>{formatDate(report.reportCreateDate)}</TableCell>
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
                <TabsContent value="Pending" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Report Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No pending reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.reportId}>
                                                <TableCell className="font-medium">{report.reportTitle}</TableCell>
                                                <TableCell>{report.userName}</TableCell>
                                                <TableCell>{report.scheduleName}</TableCell>
                                                <TableCell>{formatDate(report.reportCreateDate)}</TableCell>
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
                <TabsContent value="In Progress" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Report Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No in-progress reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.reportId}>
                                                <TableCell className="font-medium">{report.reportTitle}</TableCell>
                                                <TableCell>{report.userName}</TableCell>
                                                <TableCell>{report.scheduleName}</TableCell>
                                                <TableCell>{formatDate(report.reportCreateDate)}</TableCell>
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
                <TabsContent value="Resolved" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Report Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No resolved reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.reportId}>
                                                <TableCell className="font-medium">{report.reportTitle}</TableCell>
                                                <TableCell>{report.userName}</TableCell>
                                                <TableCell>{report.scheduleName}</TableCell>
                                                <TableCell>{formatDate(report.reportCreateDate)}</TableCell>
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
                <TabsContent value="Rejected" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Report Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <AlertTriangle className="h-8 w-8 mb-2" />
                                                    <p>No rejected reports found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report.reportId}>
                                                <TableCell className="font-medium">{report.reportTitle}</TableCell>
                                                <TableCell>{report.userName}</TableCell>
                                                <TableCell>{report.scheduleName}</TableCell>
                                                <TableCell>{formatDate(report.reportCreateDate)}</TableCell>
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
                            <DialogTitle>{selectedReport.reportTitle}</DialogTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getStatusBadge(selectedReport.reportStatus)}
                                <span>Reported on {formatDate(selectedReport.reportCreateDate)}</span>
                            </div>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reported By</h4>
                                    <p className="text-gray-900 dark:text-white">{selectedReport.userName}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Schedule</h4>
                                    <p className="text-gray-900 dark:text-white">{selectedReport.scheduleName}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h4>
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-gray-900 dark:text-white">
                                    {selectedReport.reportDescription}
                                </div>
                            </div>

                            {selectedReport.resolutionNotes && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Resolution Notes</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-gray-900 dark:text-white">
                                        {selectedReport.resolutionNotes}
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
