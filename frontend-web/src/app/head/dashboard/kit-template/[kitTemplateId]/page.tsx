"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { getAccessoryKitTemplateByKitTemplateId } from "@/services/accessoryServices"

interface AccessoryKitTemplate {
    accessoryKitTemplateId: number
    kitTemplateId: string
    kitTemplateName: string
    accessoryId: number
    accessoryName: string
    accessoryValueCode: string
    accessoryQuantity: number
    accessoryKitTemplateStatus: string
}

const getStatusBadge = (status: string) => {
    const lowerCaseStatus = status.toLowerCase()
    switch (lowerCaseStatus) {
        case "valid":
            return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
        case "invalid":
            return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}

export default function KitTemplateAccessoryPage() {
    const { kitTemplateId } = useParams<{ kitTemplateId: string }>() 
    const [accessories, setAccessories] = useState<AccessoryKitTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAccessories = useCallback(async () => {
        if (!kitTemplateId) return

        setLoading(true)
        setError(null)
        try {
            const responseData = await getAccessoryKitTemplateByKitTemplateId(kitTemplateId)

            if (responseData) {
                setAccessories(responseData)
            } else {
                setError("Failed to load data or received an unexpected format.")
            }
        } catch (err) {
            console.error("API call failed:", err)
            setError("Error fetching accessory data. Please check the network connection or API service.")
        } finally {
            setLoading(false)
        }
    }, [kitTemplateId])

    useEffect(() => {
        fetchAccessories()
    }, [fetchAccessories])

    const kitTemplateName =
        accessories.length > 0 ? accessories[0].kitTemplateName : `Kit Template (ID: ${kitTemplateId})`

    return (
        <div>
            <CardHeader>
                <CardTitle>List Accessories of {kitTemplateName}</CardTitle>
                <CardDescription>
                    List of accessories included in the kit template.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <span className="text-muted-foreground">Loading accessories...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center p-4 text-red-600 border border-red-300 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <Card>
                        <Table>
                            <TableHeader className="bg-blue-50">
                                <TableRow>
                                    <TableHead>Accessory Name</TableHead>
                                    <TableHead>Value Code</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accessories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No accessories found for this kit template.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    accessories.map((item) => (
                                        <TableRow key={item.accessoryKitTemplateId}>
                                            <TableCell className="font-medium">{item.accessoryName}</TableCell>
                                            <TableCell>{item.accessoryValueCode}</TableCell>
                                            <TableCell className="text-center">{item.accessoryQuantity}</TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(item.accessoryKitTemplateStatus)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                )}
            </CardContent>
        </div>
    )
}
