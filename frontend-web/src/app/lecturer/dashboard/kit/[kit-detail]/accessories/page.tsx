"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getKiAccessoryByKitId } from "@/services/accessoryServices"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

interface KitAccessory {
    kitAccessoryId: number
    kitId: string
    kitName: string
    accessoryId: number
    accessoryName: string
    accessoryValueCode: string
    currentAccessoryQuantity: number
    initialAccessoryQuantity: number
    validPercen: number
    kitAccessoryStatus: string
}

export default function LecturerKitAccessoriesPage() {
    const params = useParams()
    const kitId = params['kit-detail'] as string
    const [accessories, setAccessories] = useState<KitAccessory[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchAccessories = async () => {
            setLoading(true)
            try {
                const response = await getKiAccessoryByKitId(kitId)
                setAccessories(response) 
            } catch (error) {
                console.error("Failed to fetch accessories:", error)
            } finally {
                setLoading(false)
            }
        }

        if (kitId) fetchAccessories()
    }, [kitId])

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "valid":
                return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
            case "invalid":
                return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <div>
            <CardHeader>
                <CardTitle>List Accessories of {kitId}</CardTitle>
            </CardHeader>
            <CardContent>
                <Card>
                    <Table>
                        <TableHeader className="bg-blue-50">
                            <TableRow>
                                <TableHead>Accessory Name</TableHead>
                                <TableHead>Value Code</TableHead>
                                <TableHead>Initial Quantity</TableHead>
                                <TableHead>Current Quantity</TableHead>
                                <TableHead>Valid Percentage</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Loading accessories...
                                    </TableCell>
                                </TableRow>
                            ) : accessories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No accessories found for this kit.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                accessories.map((accessory) => (
                                    <TableRow key={accessory.kitAccessoryId}>
                                        <TableCell className="font-medium">{accessory.accessoryName}</TableCell>
                                        <TableCell>{accessory.accessoryValueCode}</TableCell>
                                        <TableCell>{accessory.initialAccessoryQuantity}</TableCell>
                                        <TableCell>{accessory.currentAccessoryQuantity}</TableCell>
                                        <TableCell>{accessory.validPercen}%</TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(accessory.kitAccessoryStatus)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </CardContent>
        </div>
    )
}