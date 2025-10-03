"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getKiAccessoryByKitId } from "@/services/accessoryServices"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UpdateAccessoryQuantity } from "@/components/head/accessory/UpdateAccessoryQuantity"

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

export default function KitAccessoryPage() {
    const { kitId } = useParams<{ kitId: string }>()
    const [accessories, setAccessories] = useState<KitAccessory[]>([])
    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedAccessory, setSelectedAccessory] = useState<KitAccessory | null>(null)

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

    const handleEdit = (accessory: KitAccessory) => {
        setSelectedAccessory(accessory)
        setIsDialogOpen(true)
    }

    const handleUpdate = async () => {
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
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        Loading accessories...
                                    </TableCell>
                                </TableRow>
                            ) : accessories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                                        <TableCell className="text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(accessory)}
                                                disabled={accessory.kitAccessoryStatus.toLowerCase() === "invalid"}
                                                title={accessory.kitAccessoryStatus.toLowerCase() === "invalid" ? "Cannot edit invalid accessory" : "Edit accessory"}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </CardContent>
            {selectedAccessory && (
                <UpdateAccessoryQuantity
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    accessory={selectedAccessory}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    )
}