"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Pagination } from "antd"
import { searchKitByKitTemplateId } from "@/services/kitServices"
import DashboardLayout from "@/components/dashboard-layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CheckoutKit from "@/components/lecturer/kit/CheckoutKit"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"

interface Kit {
    kitId: string
    kitTemplateId: string
    kitTemplateName: string
    kitName: string
    kitDescription: string
    kitUrlImg: string
    kitUrlQr: string
    kitCreateDate: string
    kitStatus: string
}

export default function KitDetail() {
    const searchParams = useSearchParams()
    const kitTemplateId = searchParams.get('kitTemplateId') || ''
    const [kitSearch, setKitSearch] = useState("")
    const [kitStatusFilter, setKitStatusFilter] = useState("all")
    const [kits, setKits] = useState<Kit[]>([])
    const [loading, setLoading] = useState(false)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [selectedKit, setSelectedKit] = useState<Kit | null>(null)

    const fetchKits = useCallback(async () => {
        setLoading(true)
        try {
            const response = await searchKitByKitTemplateId(kitTemplateId)
            console.log("Check KitID:", kitTemplateId)
            setKits(response) 
        } catch (error) {
            console.error("Failed to fetch kits:", error)
        } finally {
            setLoading(false)
        }
    }, [kitTemplateId])

    useEffect(() => {
        if (kitTemplateId) {
            fetchKits()
        }
    }, [fetchKits, kitTemplateId])

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "valid":
                return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
            case "inuse":
                return <Badge className="bg-orange-500 hover:bg-red-600">In Use</Badge>
            default:
                return <Badge>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        }
    }

    const handleCheckout = (kit: Kit) => {
        setSelectedKit(kit)
        setIsCheckoutOpen(true)
    }


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Kit Details</h1>
            <div className="flex gap-4 mb-4 justify-start">
                <div className="relative w-[350px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search kits..."
                        className="pl-8 w-full"
                        value={kitSearch}
                        onChange={(e) => setKitSearch(e.target.value)}
                    />
                </div>
                <Select value={kitStatusFilter} onValueChange={setKitStatusFilter}>
                    <SelectTrigger className="w-48">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Filter by Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Valid">Available</SelectItem>
                        <SelectItem value="InUse">In Use</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Card>
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Kit Template</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    Loading kits...
                                </TableCell>
                            </TableRow>
                        ) : kits.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No kits available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            kits.map((item) => (
                                <TableRow key={item.kitId}>
                                    <TableCell className="font-medium">{item.kitName}</TableCell>
                                    <TableCell>{item.kitTemplateName}</TableCell>
                                    <TableCell>{item.kitDescription}</TableCell>
                                    <TableCell>{new Date(item.kitCreateDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{getStatusBadge(item.kitStatus)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCheckout(item)}
                                            disabled={item.kitStatus.toLowerCase() === "inuse"}
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

            <CheckoutKit
                isOpen={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                kit={selectedKit}
                onSuccess={fetchKits}
            />

        </div>
    )
}