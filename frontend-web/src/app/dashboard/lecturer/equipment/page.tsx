"use client"

import DashboardLayout from "@/src/components/dashboard-layout"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Search, Plus, AlertTriangle, Clock, ArrowUpDown, Filter } from "lucide-react"
import { useState } from "react"

export default function EquipmentPage() {
  const [showBorrowDialog, setShowBorrowDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const equipmentItems = [
    {
      id: 1,
      name: "Oscilloscope",
      model: "Tektronix TBS1052B",
      serialNumber: "OSC-2023-001",
      category: "Measurement",
      status: "available",
      location: "Lab 1, Cabinet A",
      lastCalibration: "2025-01-15",
      nextCalibration: "2025-07-15",
    },
    {
      id: 2,
      name: "Digital Multimeter",
      model: "Fluke 115",
      serialNumber: "DMM-2023-012",
      category: "Measurement",
      status: "in-use",
      location: "Lab 2, Cabinet B",
      lastCalibration: "2025-02-10",
      nextCalibration: "2025-08-10",
      borrowedBy: "Dr. Johnson",
      borrowedUntil: "2025-05-20",
    },
    {
      id: 3,
      name: "Function Generator",
      model: "Rigol DG1022Z",
      serialNumber: "FG-2023-005",
      category: "Signal Generation",
      status: "maintenance",
      location: "Maintenance Room",
      issue: "Unstable output voltage",
      maintenanceUntil: "2025-05-25",
    },
    {
      id: 4,
      name: "Power Supply",
      model: "Keysight E36103A",
      serialNumber: "PS-2023-008",
      category: "Power",
      status: "available",
      location: "Lab 1, Cabinet C",
      lastCalibration: "2025-03-05",
      nextCalibration: "2025-09-05",
    },
    {
      id: 5,
      name: "Logic Analyzer",
      model: "Saleae Logic Pro 16",
      serialNumber: "LA-2023-003",
      category: "Digital",
      status: "available",
      location: "Lab 2, Cabinet A",
      lastCalibration: "2025-01-20",
      nextCalibration: "2025-07-20",
    },
    {
      id: 6,
      name: "Soldering Station",
      model: "Hakko FX-888D",
      serialNumber: "SS-2023-010",
      category: "Tools",
      status: "in-use",
      location: "Lab 1, Workbench 3",
      borrowedBy: "Dr. Smith",
      borrowedUntil: "2025-05-18",
    },
    {
      id: 7,
      name: "Oscilloscope",
      model: "Tektronix TBS1052B",
      serialNumber: "OSC-2023-002",
      category: "Measurement",
      status: "out-of-order",
      location: "Maintenance Room",
      issue: "Display not working",
      reportedBy: "Dr. Williams",
      reportedOn: "2025-05-10",
    },
  ]

  const filteredEquipment = equipmentItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      case "in-use":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Use</Badge>
      case "maintenance":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Maintenance</Badge>
      case "out-of-order":
        return <Badge className="bg-red-500 hover:bg-red-600">Out of Order</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
            <p className="text-muted-foreground">View, borrow, and report issues with lab equipment</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReportDialog(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
            <Button onClick={() => setShowBorrowDialog(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Borrow Equipment
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Equipment</TabsTrigger>
              <TabsTrigger value="borrowed">Borrowed by Me</TabsTrigger>
              <TabsTrigger value="reported">Reported Issues</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search equipment..."
                  className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out-of-order">Out of Order</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Category</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Measurement">Measurement</SelectItem>
                  <SelectItem value="Signal Generation">Signal Generation</SelectItem>
                  <SelectItem value="Power">Power</SelectItem>
                  <SelectItem value="Digital">Digital</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Inventory</CardTitle>
                <CardDescription>View and manage all lab equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-[1fr_1fr_120px_120px_100px] gap-2 p-4 font-medium border-b">
                    <div className="flex items-center gap-1 cursor-pointer">
                      Equipment <ArrowUpDown className="h-4 w-4" />
                    </div>
                    <div>Location</div>
                    <div>Category</div>
                    <div className="flex items-center gap-1 cursor-pointer">
                      Status <ArrowUpDown className="h-4 w-4" />
                    </div>
                    <div>Actions</div>
                  </div>

                  {filteredEquipment.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No equipment found matching your filters.
                    </div>
                  ) : (
                    filteredEquipment.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_1fr_120px_120px_100px] gap-2 p-4 border-b last:border-0 items-center"
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.model}</div>
                          <div className="text-xs text-muted-foreground">{item.serialNumber}</div>
                        </div>
                        <div className="text-sm">{item.location}</div>
                        <div className="text-sm">{item.category}</div>
                        <div>{getStatusBadge(item.status)}</div>
                        <div className="flex gap-2">
                          {item.status === "available" && (
                            <Button size="sm" variant="outline" onClick={() => setShowBorrowDialog(true)}>
                              Borrow
                            </Button>
                          )}
                          {item.status !== "out-of-order" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500"
                              onClick={() => setShowReportDialog(true)}
                            >
                              Report
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="borrowed">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Borrowed by Me</CardTitle>
                <CardDescription>Manage equipment you have borrowed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-[1fr_1fr_150px_120px] gap-2 p-4 font-medium border-b">
                    <div>Equipment</div>
                    <div>Location</div>
                    <div>Due Date</div>
                    <div>Actions</div>
                  </div>

                  {filteredEquipment.filter((item) => item.status === "in-use" && item.borrowedBy === "Dr. Smith")
                    .length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">You haven't borrowed any equipment.</div>
                  ) : (
                    filteredEquipment
                      .filter((item) => item.status === "in-use" && item.borrowedBy === "Dr. Smith")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[1fr_1fr_150px_120px] gap-2 p-4 border-b last:border-0 items-center"
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.model}</div>
                            <div className="text-xs text-muted-foreground">{item.serialNumber}</div>
                          </div>
                          <div className="text-sm">{item.location}</div>
                          <div className="text-sm flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            {new Date(item.borrowedUntil).toLocaleDateString()}
                          </div>
                          <div>
                            <Button size="sm" variant="outline" className="text-green-500">
                              Return
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reported">
            <Card>
              <CardHeader>
                <CardTitle>Reported Issues</CardTitle>
                <CardDescription>Track issues you've reported with lab equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEquipment.filter(
                    (item) =>
                      (item.status === "maintenance" || item.status === "out-of-order") &&
                      item.reportedBy === "Dr. Smith",
                  ).length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground border rounded-md">
                      You haven't reported any equipment issues.
                    </div>
                  ) : (
                    filteredEquipment
                      .filter(
                        (item) =>
                          (item.status === "maintenance" || item.status === "out-of-order") &&
                          item.reportedBy === "Dr. Smith",
                      )
                      .map((item) => (
                        <div key={item.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {item.name} - {item.model}
                              </div>
                              <div className="text-sm text-muted-foreground">{item.serialNumber}</div>
                            </div>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="mt-2">
                            <div className="text-sm font-medium">Issue:</div>
                            <div className="text-sm">{item.issue}</div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                            <div>Reported on: {new Date(item.reportedOn).toLocaleDateString()}</div>
                            {item.status === "maintenance" && (
                              <div className="flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                Expected completion: {new Date(item.maintenanceUntil).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showBorrowDialog} onOpenChange={setShowBorrowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Borrow Equipment</DialogTitle>
            <DialogDescription>Select equipment to borrow for your lab sessions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="equipment">Equipment</Label>
              <Select>
                <SelectTrigger id="equipment">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="osc1">Oscilloscope - Tektronix TBS1052B (OSC-2023-001)</SelectItem>
                  <SelectItem value="ps1">Power Supply - Keysight E36103A (PS-2023-008)</SelectItem>
                  <SelectItem value="la1">Logic Analyzer - Saleae Logic Pro 16 (LA-2023-003)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="borrow-date">Borrow Date</Label>
                <Input id="borrow-date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="return-date">Return Date</Label>
                <Input id="return-date" type="date" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select>
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class Session</SelectItem>
                  <SelectItem value="prep">Session Preparation</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input id="notes" placeholder="Any special requirements or notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBorrowDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowBorrowDialog(false)}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report Equipment Issue</DialogTitle>
            <DialogDescription>Report a problem with lab equipment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="report-equipment">Equipment</Label>
              <Select>
                <SelectTrigger id="report-equipment">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="osc1">Oscilloscope - Tektronix TBS1052B (OSC-2023-001)</SelectItem>
                  <SelectItem value="dmm1">Digital Multimeter - Fluke 115 (DMM-2023-012)</SelectItem>
                  <SelectItem value="fg1">Function Generator - Rigol DG1022Z (FG-2023-005)</SelectItem>
                  <SelectItem value="ps1">Power Supply - Keysight E36103A (PS-2023-008)</SelectItem>
                  <SelectItem value="la1">Logic Analyzer - Saleae Logic Pro 16 (LA-2023-003)</SelectItem>
                  <SelectItem value="ss1">Soldering Station - Hakko FX-888D (SS-2023-010)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issue-type">Issue Type</Label>
              <Select>
                <SelectTrigger id="issue-type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-working">Not Working</SelectItem>
                  <SelectItem value="damaged">Physically Damaged</SelectItem>
                  <SelectItem value="calibration">Calibration Issue</SelectItem>
                  <SelectItem value="missing">Missing Components</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Describe the issue in detail" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Select>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can still be used</SelectItem>
                  <SelectItem value="medium">Medium - Limited functionality</SelectItem>
                  <SelectItem value="high">High - Cannot be used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowReportDialog(false)}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}