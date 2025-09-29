"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, RotateCcw, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useClientOnly } from "@/hooks/useClientOnly"
import { searchTeamEquipmentByLecturerId, giveBackEquipment } from "@/services/teamEquipmentServices"
import { Pagination } from 'antd'
import CreateCheckout from "@/components/lecturer/equipment-checkout/CreateCheckout"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"

interface CheckoutItem {
    teamEquipmentId: number
    equipmentName: string
    equipmentNumberSerial: string
    teamName: string
    className: string
    teamEquipmentDateBorrow: string
    teamEquipmentDateGiveBack: string
    status: "Paid" | "AreBorrowing"
}

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Paid", label: "Returned" },
    { value: "AreBorrowing", label: "Borrowing" },
]

export default function EquipmentHandover() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [checkoutData, setCheckoutData] = useState<CheckoutItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [pageInfo, setPageInfo] = useState({ page: 1, size: 10, totalItems: 0 })
    const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
    const hasMounted = useClientOnly()
    const [isGivingBack, setIsGivingBack] = useState<number | null>(null)
    const { user } = useAuth()

    const fetchCheckoutData = async () => {
        setIsLoading(true)
        try {
            if (!user?.userId) {
                throw new Error("User ID not found")
            }
            const response = await searchTeamEquipmentByLecturerId({
                pageNum: pageInfo.page,
                pageSize: pageInfo.size,
                lecturerId: user.userId,
            })
            if (response.pageData) {
                const mappedData: CheckoutItem[] = response.pageData.map((item: any) => ({
                    teamEquipmentId: item.teamEquipmentId,
                    equipmentName: item.equipmentName,
                    equipmentNumberSerial: item.equipmentNumberSerial,
                    teamName: item.teamName,
                    className: item.className || "-",
                    teamEquipmentDateBorrow: item.teamEquipmentDateBorrow,
                    teamEquipmentDateGiveBack: item.teamEquipmentDateGiveBack || "",
                    status: item.teamEquipmentStatus,
                }))
                setCheckoutData(mappedData)
                setPageInfo({
                    page: response.pageInfo.page,
                    size: response.pageInfo.size,
                    totalItems: response.pageInfo.totalItem,
                })
            }
        } catch (error) {
            console.error("Error fetching checkout data:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách bàn giao",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (hasMounted) {
            fetchCheckoutData()
        }
    }, [hasMounted, pageInfo.page, pageInfo.size, searchTerm, selectedStatus])

    const filteredCheckoutData = useMemo(() => {
        return checkoutData.filter(item => {
            const matchesSearch = searchTerm === "" ||
                item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.equipmentNumberSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.className.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = selectedStatus === "all" || item.status === selectedStatus

            return matchesSearch && matchesStatus
        })
    }, [checkoutData, searchTerm, selectedStatus])

    const handlePaginationChange = (page: number, pageSize?: number) => {
        setPageInfo(prev => ({
            ...prev,
            page,
            size: pageSize || prev.size,
        }))
    }

    const handleCheckoutSuccess = (newCheckout: any) => {
        setPageInfo(prev => ({ ...prev, page: 1 }))
        setIsCheckoutDialogOpen(false)
    }

    const handleReturnEquipment = async (teamEquipmentId: number) => {
        setIsGivingBack(teamEquipmentId);
        try {
            await giveBackEquipment(teamEquipmentId);
            fetchCheckoutData();
        } catch (error) {
            console.error("Error returning equipment:", error);
            toast({
                title: "Lỗi",
                description: "Không thể trả lại thiết bị. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsGivingBack(null);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Paid":
                return "default"
            case "AreBorrowing":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "Paid":
                return "Returned"
            case "AreBorrowing":
                return "Borrowing"
            default:
                return status
        }
    }

    const formatDate = (dateString: string) => {
        return dateString ? new Date(dateString).toLocaleDateString('vi-VN') : "-"
    }

    const renderTableView = () => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead className="w-[50px]">STT</TableHead>
                            <TableHead>Equipment Name</TableHead>
                            <TableHead>Number Serial</TableHead>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Borrowed Date</TableHead>
                            <TableHead>Return Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredCheckoutData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4">
                                    No checkouts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCheckoutData.map((checkout, index) => (
                                <TableRow key={checkout.teamEquipmentId}>
                                    <TableCell>{(pageInfo.page - 1) * pageInfo.size + index + 1}</TableCell>
                                    <TableCell className="font-medium">{checkout.equipmentName || "-"}</TableCell>
                                    <TableCell>{checkout.equipmentNumberSerial || "-"}</TableCell>
                                    <TableCell>{checkout.teamName || "-"}</TableCell>
                                    <TableCell>{checkout.className || "-"}</TableCell>
                                    <TableCell>{formatDate(checkout.teamEquipmentDateBorrow)}</TableCell>
                                    <TableCell>{formatDate(checkout.teamEquipmentDateGiveBack)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(checkout.status)} className="flex items-center gap-1 w-fit">
                                            {getStatusLabel(checkout.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {checkout.status === "AreBorrowing" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReturnEquipment(checkout.teamEquipmentId)}
                                                disabled={isGivingBack === checkout.teamEquipmentId}
                                            >
                                                {isGivingBack === checkout.teamEquipmentId ? "Returning..." : "Return"}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )

    if (!hasMounted) {
        return (
            <div className="min-h-screen p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by equipment name, code, team, or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-48">
                            <Filter className="h-4 w-4" />
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
                <Button
                    onClick={() => setIsCheckoutDialogOpen(true)}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
                >
                    Checkout
                </Button>
            </div>

            {filteredCheckoutData.length === 0 && !isLoading ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No checkouts found.
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search criteria.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {renderTableView()}
                    <div className="flex justify-end p-4">
                        <Pagination
                            current={pageInfo.page}
                            pageSize={pageInfo.size}
                            total={pageInfo.totalItems}
                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                            onChange={handlePaginationChange}
                            showSizeChanger
                            onShowSizeChange={(current, size) => {
                                setPageInfo(prev => ({
                                    ...prev,
                                    page: 1,
                                    size,
                                }))
                            }}
                        />
                    </div>
                </>
            )}

            <CreateCheckout
                isOpen={isCheckoutDialogOpen}
                onClose={() => setIsCheckoutDialogOpen(false)}
                onSuccess={handleCheckoutSuccess}
            />
        </div>
    )
}