"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Filter } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { searchEquipment } from "@/services/equipmentServices"
import { Button } from "@/components/ui/button"
import { Pagination } from 'antd'
import CheckoutEquipment from "@/components/lecturer/equipment/CheckoutEquipment"
import Image from "next/image" // Import Next.js Image component for optimized image rendering

interface Equipment {
  equipmentId: number
  equipmentName: string
  equipmentCode: string
  equipmentNumberSerial: string
  equipmentStatus: string
  equipmentQr: string
  equipmentTypeUrlImg: string // Added field for image URL
}

export default function EquipmentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [initialEquipmentItems, setInitialEquipmentItems] = useState<Equipment[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null) // Updated to store image URL
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<{ equipmentId: number; equipmentName: string; equipmentNumberSerial: string } | null>(null)

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "inuse", label: "In Use" },
    { value: "available", label: "Available" },
    { value: "maintenance", label: "Maintenance" },
    { value: "damaged", label: "Damaged" },
  ]

  const fetchEquipment = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await searchEquipment({
        pageNum: 1,
        pageSize: 9999,
        keyWord: "",
        status: "",
      })
      setInitialEquipmentItems(response.pageData || [])
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch equipment"
      setError(errorMessage)
      console.error("Error fetching equipment:", err)
      setInitialEquipmentItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  const equipmentItems = useMemo(() => {
    let filteredItems = initialEquipmentItems

    if (selectedStatus !== "all") {
      filteredItems = filteredItems.filter(item =>
        item.equipmentStatus.toLowerCase() === selectedStatus
      )
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase().trim()
      filteredItems = filteredItems.filter(item =>
        item.equipmentName.toLowerCase().includes(lowerCaseQuery) ||
        item.equipmentCode.toLowerCase().includes(lowerCaseQuery) ||
        item.equipmentNumberSerial.toLowerCase().includes(lowerCaseQuery)
      )
    }

    setTotalItems(filteredItems.length)

    const startIndex = (pageNum - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredItems.slice(startIndex, endIndex)
  }, [initialEquipmentItems, searchQuery, selectedStatus, pageNum, pageSize])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      case "in-use":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Use</Badge>
      case "maintenance":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Maintenance</Badge>
      case "damaged":
        return <Badge className="bg-red-500 hover:bg-red-600">Damaged</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleCheckout = (equipment: Equipment) => {
    setSelectedEquipment({
      equipmentId: equipment.equipmentId,
      equipmentName: equipment.equipmentName,
      equipmentNumberSerial: equipment.equipmentNumberSerial,
    })
    setIsCheckoutDialogOpen(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPageNum(1)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    setPageNum(1)
  }

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPageNum(page)
    setPageSize(pageSize || 10)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, code, or serial number..."
                className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Select
              value={selectedStatus}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Equipment Name</TableHead>
                <TableHead>EquipmentType</TableHead>
                <TableHead>Number Serial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Image</TableHead> {/* Updated header from "QR Code" to "Image" */}
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-4 text-center text-muted-foreground">
                    Loading equipment...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-4 text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : equipmentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-4 text-center text-muted-foreground">
                    No equipment found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                equipmentItems.map((item: Equipment, index: number) => (
                  <TableRow key={item.equipmentId ?? `fallback-${index}`} className="border-b">
                    <TableCell>{(pageNum - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="font-medium">{item.equipmentName}</TableCell>
                    <TableCell>{item.equipmentCode}</TableCell>
                    <TableCell>{item.equipmentNumberSerial}</TableCell>
                    <TableCell>{getStatusBadge(item.equipmentStatus)}</TableCell>
                    <TableCell>
                      {item.equipmentTypeUrlImg ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" onClick={() => setSelectedImageUrl(item.equipmentTypeUrlImg)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Image of {item.equipmentName}</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center p-4">
                              <Image
                                src={selectedImageUrl || item.equipmentTypeUrlImg}
                                alt={item.equipmentName}
                                width={256}
                                height={256}
                                className="object-contain"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-muted-foreground">No Image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckout(item)}
                        disabled={item.equipmentStatus.toLowerCase() !== "available"}
                      >
                        Checkout
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        <div className="flex justify-end p-4">
          <Pagination
            current={pageNum}
            pageSize={pageSize}
            total={totalItems}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            onChange={handlePaginationChange}
            showSizeChanger
            onShowSizeChange={(current, size) => {
              setPageNum(1)
              setPageSize(size)
            }}
          />
        </div>
      </div>

      <CheckoutEquipment
        isOpen={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
        equipment={selectedEquipment}
        onSuccess={fetchEquipment}
      />
    </div>
  )
}