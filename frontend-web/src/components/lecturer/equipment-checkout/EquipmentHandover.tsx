"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Calendar, Plus, Eye, Edit, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClientOnly } from "@/hooks/useClientOnly"
import CreateCheckout from "@/components/lecturer/equipment-checkout/CreateCheckout"
import EditCheckout from "@/components/lecturer/equipment-checkout/EditCheckout"
import DeleteCheckout from "@/components/lecturer/equipment-checkout/DeleteCheckout"
import CheckoutDetail from "@/components/lecturer/equipment-checkout/CheckoutDetail"
import { searchTeamEquipment } from "@/services/teamEquipmentServices"
import { Pagination } from 'antd'

interface CheckoutItem {
    id: number
    equipmentName: string
    equipmentNumberSerial: string
    teamEquipmentName: string
    teamEquipmentDateBorrow: string
    teamEquipmentDateGiveBack: string
    status: "InUse" | "Available" | "Maintenance" | "Damaged"
}

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "InUse", label: "In Use" },
    { value: "Available", label: "Available" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Damaged", label: "Damaged" },
]

export default function EquipmentHandover() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [checkoutData, setCheckoutData] = useState<CheckoutItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedCheckoutId, setSelectedCheckoutId] = useState<number | null>(null)
    const [pageInfo, setPageInfo] = useState({ page: 1, size: 10, totalItems: 0 })
    const hasMounted = useClientOnly()

    useEffect(() => {
        const fetchCheckoutData = async () => {
            setIsLoading(true)
            try {
                const response = await searchTeamEquipment({
                    pageNum: pageInfo.page,
                    pageSize: pageInfo.size,
                    keyWord: searchTerm,
                })
                if (response.pageData) {
                    const mappedData: CheckoutItem[] = response.pageData.map((item: any) => ({
                        id: item.teamEquipmentId,
                        equipmentName: item.equipmentName,
                        equipmentNumberSerial: item.equipmentNumberSerial,
                        teamEquipmentName: item.teamEquipmentName,
                        teamEquipmentDateBorrow: item.teamEquipmentDateBorrow,
                        teamEquipmentDateGiveBack: item.teamEquipmentDateGiveBack,
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
            } finally {
                setIsLoading(false)
            }
        }

        if (hasMounted) {
            fetchCheckoutData()
        }
    }, [hasMounted, pageInfo.page, pageInfo.size, searchTerm, selectedStatus])

    const filteredCheckoutData = useMemo(() => {
        return checkoutData.filter(item => {
            const matchesSearch = searchTerm === "" ||
                item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.equipmentNumberSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.teamEquipmentName.toLowerCase().includes(searchTerm.toLowerCase())

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

    const handleCreateSuccess = (newCheckout: CheckoutItem) => {
        setCheckoutData(prev => [newCheckout, ...prev])
    }

    const handleViewDetail = (checkoutId: number) => {
        setSelectedCheckoutId(checkoutId)
        setIsDetailModalOpen(true)
    }

    const handleCloseDetail = () => {
        setIsDetailModalOpen(false)
        setSelectedCheckoutId(null)
    }

    const handleEditCheckout = (checkoutId: number) => {
        setSelectedCheckoutId(checkoutId)
        setIsEditModalOpen(true)
    }

    const handleCloseEdit = () => {
        setIsEditModalOpen(false)
        setSelectedCheckoutId(null)
    }

    const handleEditSuccess = (updatedCheckout: CheckoutItem) => {
        setCheckoutData(prev => prev.map(item =>
            item.id === updatedCheckout.id ? updatedCheckout : item
        ))
    }

    const handleDeleteCheckout = (checkoutId: number) => {
        setSelectedCheckoutId(checkoutId)
        setIsDeleteModalOpen(true)
    }

    const handleCloseDelete = () => {
        setIsDeleteModalOpen(false)
        setSelectedCheckoutId(null)
    }

    const handleDeleteSuccess = (checkoutId: number) => {
        setCheckoutData(prev => prev.filter(item => item.id !== checkoutId))
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Available":
                return "default"
            case "InUse":
                return "secondary"
            case "Maintenance":
                return "outline"
            case "Damaged":
                return "destructive"
            case "Valid":
                return "default"
            default:
                return "outline"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "Available":
                return "Available"
            case "InUse":
                return "In Use"
            case "Maintenance":
                return "Maintenance"
            case "Damaged":
                return "Damaged"
            case "Valid":
                return "Valid"
            default:
                return status
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const renderTableView = () => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead className="w-[50px]">STT</TableHead>
                            <TableHead>Equipment Name</TableHead>
                            <TableHead>Equipment Code</TableHead>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Borrowed Date</TableHead>
                            <TableHead>Return Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
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
                                <TableRow key={checkout.id}>
                                    <TableCell>{(pageInfo.page - 1) * pageInfo.size + index + 1}</TableCell>
                                    <TableCell className="font-medium">{checkout.equipmentName}</TableCell>
                                    <TableCell>{checkout.equipmentNumberSerial}</TableCell>
                                    <TableCell>{checkout.teamEquipmentName || "-"}</TableCell>
                                    <TableCell>{formatDate(checkout.teamEquipmentDateBorrow)}</TableCell>
                                    <TableCell>{formatDate(checkout.teamEquipmentDateGiveBack) || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(checkout.status)} className="flex items-center gap-1 w-fit">
                                            {getStatusLabel(checkout.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEditCheckout(checkout.id)}
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteCheckout(checkout.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Checkouts</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {pageInfo.totalItems}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">In Use</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {checkoutData.filter((c) => c.status === "InUse").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Returned</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {checkoutData.filter((c) => c.status === "Available").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {checkoutData.filter((c) => c.status === "Maintenance").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by equipment name, code, team..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Assign Equipment
                </Button>
            </div>

            {filteredCheckoutData.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No checkouts found.
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search criteria or create a new checkout.
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
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* <CheckoutDetail
                checkoutId={selectedCheckoutId}
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetail}
                onEdit={handleEditCheckout}
                onDelete={handleDeleteCheckout}
            />

            <EditCheckout
                checkoutId={selectedCheckoutId}
                isOpen={isEditModalOpen}
                onClose={handleCloseEdit}
                onSuccess={handleEditSuccess}
            />

            <DeleteCheckout
                checkoutId={selectedCheckoutId}
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDelete}
                onSuccess={handleDeleteSuccess}
            /> */}
        </div>
    )
}