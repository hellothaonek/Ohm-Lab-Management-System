"use client"

import { useState } from "react"
import { Plus, AlertTriangle, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
]

const reportsData = [
  {
    id: 1,
    title: "Oscilloscope Display Malfunction",
    description: "The display on oscilloscope #3 flickers.",
    equipmentType: "oscilloscope",
    serialNumber: "TEKTRO-OSC-2023-003",
    reportDate: "2025-05-15T09:30:00",
    status: "pending",
    updatedDate: "2025-05-15T09:30:00",
    comments: [],
  },
]

export default function StudentReportsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    equipmentType: "",
    serialNumber: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setNewReport((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateReport = () => {
    // TODO: integrate API
    setIsCreateDialogOpen(false)
    setNewReport({ title: "", description: "", equipmentType: "", serialNumber: "" })
  }

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    setIsViewDialogOpen(true)
  }

  const filteredReports = reportsData.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = activeTab === "all" || report.status === activeTab
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "resolved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
      <div className="min-h-screen p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipment Reports</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create Equipment Report</DialogTitle>
                  <DialogDescription>Report damaged or malfunctioning equipment.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input id="title" placeholder="Brief description" value={newReport.title} onChange={(e) => handleInputChange("title", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="equipmentType">Equipment Type</Label>
                      <Input id="equipmentType" placeholder="Enter equipment type" value={newReport.equipmentType} onChange={(e) => handleInputChange("equipmentType", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="serialNumber">Serial Number</Label>
                      <Input id="serialNumber" placeholder="Equipment serial/ID" value={newReport.serialNumber} onChange={(e) => handleInputChange("serialNumber", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe the issue" rows={5} value={newReport.description} onChange={(e) => handleInputChange("description", e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCreateReport} disabled={!newReport.title || !newReport.description || !newReport.equipmentType || !newReport.serialNumber}>Submit Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
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
                      <TableHead>Serial Number</TableHead>
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
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>{report.equipmentType}</TableCell>
                          <TableCell className="font-mono text-sm">{report.serialNumber}</TableCell>
                          <TableCell>{new Date(report.reportDate).toLocaleDateString("vi-VN")}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
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
                      <TableHead>Serial Number</TableHead>
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
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>{report.equipmentType}</TableCell>
                          <TableCell className="font-mono text-sm">{report.serialNumber}</TableCell>
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
          <TabsContent value="resolved" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Report Date</TableHead>
                      <TableHead>Resolved Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
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
                          <TableCell>{report.equipmentType}</TableCell>
                          <TableCell className="font-mono text-sm">{report.serialNumber}</TableCell>
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

        {selectedReport && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedReport.title}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getStatusBadge(selectedReport.status)}
                  <span>Reported on {new Date(selectedReport.reportDate).toLocaleDateString("vi-VN")}</span>
                </div>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Equipment Type</h4>
                    <p className="text-gray-900 dark:text-white">{selectedReport.equipmentType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number</h4>
                    <p className="text-gray-900 dark:text-white font-mono">{selectedReport.serialNumber}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-gray-900 dark:text-white">{selectedReport.description}</div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
  )
}


