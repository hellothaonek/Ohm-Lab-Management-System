"use client"
import DashboardLayout from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { searchEquipment } from "@/services/equipmentServices"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Pagination } from 'antd' // Import Ant Design Pagination

interface Equipment {
  equipmentId: number;
  equipmentName: string;
  equipmentCode: string;
  equipmentNumberSerial: string;
  equipmentStatus: string;
  equipmentQr: string
}

export default function EquipmentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [equipmentItems, setEquipmentItems] = useState<Equipment[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0) // Added totalItems state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "in-use", label: "In Use" },
    { value: "available", label: "Available" },
    { value: "maintenance", label: "Maintenance" },
    { value: "out-of-order", label: "Damaged" },
  ]

  const fetchEquipment = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await searchEquipment({
        pageNum,
        pageSize,
        keyWord: searchQuery,
        status: selectedStatus === "all" ? "" : selectedStatus,
      })
      setEquipmentItems(response.pageData)
      setTotalItems(response.pageInfo?.totalItem || 0) // Update totalItems from response
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch equipment"
      setError(errorMessage)
      console.error("Error fetching equipment:", err)
      setEquipmentItems([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, pageNum, pageSize, selectedStatus])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
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

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPageNum(page)
    setPageSize(pageSize || 10)
  }

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Danh sách thiết bị</h1>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm tên thiết bị..."
                  className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPageNum(1)
                  }}
                />
              </div>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value)
                  setPageNum(1)
                }}
              >
                <SelectTrigger className="w-48">
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
            <div className="grid grid-cols-[1fr_1fr_1fr_120px_120px] gap-2 p-4 font-medium border-b">
              <div>Tên Thiết Bị</div>
              <div>Loại Thiết Bị</div>
              <div>Mã Thiết Bị</div>
              <div>Trạng Thái</div>
              <div>Mã QR</div>
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading equipment...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : equipmentItems.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No equipment found matching your filters.
              </div>
            ) : (
              equipmentItems.map((item: Equipment, index: number) => (
                <div
                  key={item.equipmentId ?? `fallback-${index}`}
                  className="grid grid-cols-[1fr_1fr_1fr_120px_120px] gap-2 p-4 border-b last:border-0 items-center"
                >
                  <div>
                    <div className="font-medium">{item.equipmentName}</div>
                  </div>
                  <div className="text-sm">{item.equipmentCode}</div>
                  <div className="text-sm">{item.equipmentNumberSerial}</div>
                  <div>{getStatusBadge(item.equipmentStatus)}</div>
                  <div>
                    {item.equipmentQr ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" onClick={() => setSelectedQrCode(item.equipmentQr!)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Mã QR Của {item.equipmentName}</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center p-4">
                            <QRCodeCanvas value={selectedQrCode || ''} size={256} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-muted-foreground">No QR</span>
                    )}
                  </div>
                </div>
              ))
            )}
            {/* Add Pagination */}
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
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}