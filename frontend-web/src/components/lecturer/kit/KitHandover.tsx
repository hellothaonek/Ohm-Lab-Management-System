"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Plus, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pagination } from 'antd'
import { useClientOnly } from "@/hooks/useClientOnly"
import { toast } from "@/components/ui/use-toast"
import { searchTeamKit, giveBackTeamKit } from "@/services/teamKitServices"
import CreateCheckoutKit from "./CreateCheckoutKit"

interface KitHandoverProps {
    setShowBorrowDialog: (value: boolean) => void
}

interface KitCheckoutItem {
    teamKitId: number
    kitName: string
    kitNumberSerial: string
    teamKitName: string
    className: string
    teamKitDateBorrow: string
    teamKitDateGiveBack: string
    status: "Paid" | "AreBorrowing"
}

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Paid", label: "Paid" },
    { value: "AreBorrowing", label: "Are Borrowing" },
]

export default function KitHandover({ setShowBorrowDialog }: KitHandoverProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [kitCheckoutData, setKitCheckoutData] = useState<KitCheckoutItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [pageInfo, setPageInfo] = useState({ page: 1, size: 10, totalItems: 0 })
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
    const hasMounted = useClientOnly()

    const fetchKitCheckoutData = async () => {
        setIsLoading(true)
        try {
            const response = await searchTeamKit({
                pageNum: pageInfo.page,
                pageSize: pageInfo.size,
                keyWord: searchTerm,
            })
            if (response.pageData) {
                const mappedData: KitCheckoutItem[] = response.pageData.map((item: any) => ({
                    teamKitId: item.teamKitId,
                    kitName: item.kitName,
                    kitNumberSerial: item.kitId,
                    teamKitName: item.teamName,
                    className: item.className || "-",
                    teamKitDateBorrow: item.teamKitDateBorrow,
                    teamKitDateGiveBack: item.teamKitDateGiveBack || "",
                    status: item.teamKitStatus,
                }))
                setKitCheckoutData(mappedData)
                setPageInfo({
                    page: response.pageInfo.page,
                    size: response.pageInfo.size,
                    totalItems: response.pageInfo.totalItem,
                })
            }
        } catch (error) {
            console.error("Error fetching kit checkout data:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách bàn giao bộ kit",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (hasMounted) {
            fetchKitCheckoutData()
        }
    }, [hasMounted, pageInfo.page, pageInfo.size, searchTerm, selectedStatus])

    const filteredKitCheckoutData = useMemo(() => {
        return kitCheckoutData.filter(item => {
            const matchesSearch = searchTerm === "" ||
                item.kitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.kitNumberSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.teamKitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.className.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = selectedStatus === "all" || item.status === selectedStatus

            return matchesSearch && matchesStatus
        })
    }, [kitCheckoutData, searchTerm, selectedStatus])

    const handlePaginationChange = (page: number, pageSize?: number) => {
        setPageInfo(prev => ({
            ...prev,
            page,
            size: pageSize || prev.size,
        }))
    }

    const handleCheckoutClick = () => {
        setShowCheckoutDialog(true)
        setShowBorrowDialog(true)
    }

    const handleCheckoutSuccess = (checkout: any) => {
        fetchKitCheckoutData()
        toast({
            title: "Thành công",
            description: "Bàn giao bộ kit thành công",
            variant: "default"
        })
    }

    // Handler for the Return button
    const handleReturnClick = async (teamKitId: number) => {
        try {
            await giveBackTeamKit(teamKitId)
            await fetchKitCheckoutData() // Refresh data after return
        } catch (error) {
            console.error("Error returning kit:", error)
            toast({
                title: "Lỗi",
                description: "Không thể trả bộ kit",
                variant: "destructive"
            })
        }
    }

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
                return "Paid"
            case "AreBorrowing":
                return "Are Borrowing"
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
                            <TableHead>Kit Name</TableHead>
                            <TableHead>Kit Code</TableHead>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Borrowed Date</TableHead>
                            <TableHead>Return Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredKitCheckoutData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4">
                                    No kit checkouts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredKitCheckoutData.map((kitCheckout, index) => (
                                <TableRow key={kitCheckout.teamKitId}>
                                    <TableCell>{(pageInfo.page - 1) * pageInfo.size + index + 1}</TableCell>
                                    <TableCell className="font-medium">{kitCheckout.kitName || "-"}</TableCell>
                                    <TableCell>{kitCheckout.kitNumberSerial || "-"}</TableCell>
                                    <TableCell>{kitCheckout.teamKitName || "-"}</TableCell>
                                    <TableCell>{kitCheckout.className || "-"}</TableCell>
                                    <TableCell>{formatDate(kitCheckout.teamKitDateBorrow)}</TableCell>
                                    <TableCell>{formatDate(kitCheckout.teamKitDateGiveBack)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(kitCheckout.status)} className="flex items-center gap-1 w-fit">
                                            {getStatusLabel(kitCheckout.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {kitCheckout.status === "AreBorrowing" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReturnClick(kitCheckout.teamKitId)}
                                            >
                                                Return
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
                            placeholder="Search by kit name, code, team, or class..."
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
                    <Button onClick={handleCheckoutClick} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
                        Checkout
                    </Button>
                </div>
            </div>

            <CreateCheckoutKit
                isOpen={showCheckoutDialog}
                onClose={() => {
                    setShowCheckoutDialog(false)
                    setShowBorrowDialog(false)
                }}
                onSuccess={handleCheckoutSuccess}
            />

            {filteredKitCheckoutData.length === 0 && !isLoading ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No kit checkouts found.
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
        </div>
    )
}