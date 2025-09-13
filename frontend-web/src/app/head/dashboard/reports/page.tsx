"use client"

import { useState, useEffect } from "react"
import { Search, Plus, AlertTriangle, Eye, Edit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getAllReports, updateReportStatus } from "@/services/reportServices"
import ChangeStatus from "@/components/admin/report/ChangeStatus"

// Define interfaces
interface Report {
    reportId: number
    userId: string
    userName: string
    scheduleId: number
    scheduleName: string
    reportTitle: string
    reportDescription: string
    reportCreateDate: string
    reportStatus: string
    resolutionNotes: string | null
}

export default function AdminReportsPage() {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
    const [isChangeStatusOpen, setIsChangeStatusOpen] = useState<boolean>(false)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>("all")

    // Fetch reports on component mount
    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true)
                const response = await getAllReports()
                console.log("Fetched reports:", response.reports)
                setReports(response.reports)
                setError(null)
            } catch (err) {
                setError("Failed to fetch reports. Please try again.")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    const handleViewReport = (report: Report) => {
        setSelectedReport(report)
        setIsViewDialogOpen(true)
    }

    const handleChangeStatus = (report: Report) => {
        setSelectedReport(report)
        setIsChangeStatusOpen(true)
    }

    const handleStatusUpdate = async () => {
        try {
            const response = await getAllReports()
            setReports(response.reports)
            setError(null)
        } catch (err) {
            setError("Failed to refresh reports. Please try again.")
            console.error(err)
        }
    }

    const filteredReports = reports.filter((report: Report) => {
        const matchesSearch =
            report.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.userName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTab =
            activeTab === "all" ||
            (activeTab === "pending" && report.reportStatus === "Pending") ||
            (activeTab === "resolved" && report.reportStatus === "Resolved")
        return matchesSearch && matchesTab
    })

    const getStatusBadge = (status: Report['reportStatus']) => {
        switch (status) {
            case "Pending":
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                    </Badge>
                )
            case "Resolved":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Resolved
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="min-h-screen p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Reports</h1>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="all">All Reports</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Search Input */}
                <div className="mt-4 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search reports by title, or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-8">Loading reports...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-blue-50">
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Reported By</TableHead>
                                    <TableHead>Resolution Notes</TableHead>
                                    <TableHead>Report Date</TableHead>
                                    <TableHead>Status</TableHead>
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
                                    filteredReports.map((report: Report) => (
                                        <TableRow key={report.reportId}>
                                            <TableCell className="font-medium">{report.reportTitle}</TableCell>
                                            <TableCell>{report.userName}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {report.resolutionNotes || "No resolution notes"}
                                            </TableCell>
                                            <TableCell>{new Date(report.reportCreateDate).toLocaleDateString("vi-VN")}</TableCell>
                                            <TableCell>{getStatusBadge(report.reportStatus)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleViewReport(report)}>
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleChangeStatus(report)}>
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* View Report Dialog */}
            {selectedReport && (
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{selectedReport.reportTitle}</DialogTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getStatusBadge(selectedReport.reportStatus)}
                                <span>Reported on {new Date(selectedReport.reportCreateDate).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reported By</h4>
                                    <p className="text-gray-900 dark:text-white">{selectedReport.userName}</p>
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

            {/* Change Status Dialog */}
            {selectedReport && (
                <ChangeStatus
                    report={selectedReport}
                    onClose={() => setIsChangeStatusOpen(false)}
                    onStatusUpdate={handleStatusUpdate}
                    open={isChangeStatusOpen}
                />
            )}
        </div>
    )
}