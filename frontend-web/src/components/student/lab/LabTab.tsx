"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ClipboardList, Target, Cpu, Package } from "lucide-react"
import { getLabByClassById } from "@/services/labServices"
import { Pagination } from "antd"

interface Lab {
    labId: number
    subjectId: number
    labName: string
    labRequest: string
    labTarget: string
    labStatus: string
    requiredEquipments: {
        equipmentTypeId: string
        equipmentTypeName?: string
    }[]
    requiredKits: {
        kitTemplateId: string
        kitTemplateName?: string
    }[]
}

interface LabTabProps {
    classId: string
}

export default function LabTab({ classId }: LabTabProps) {
    const [labs, setLabs] = useState<Lab[]>([])
    const [loadingLabs, setLoadingLabs] = useState(true)
    const [errorLabs, setErrorLabs] = useState<string | null>(null)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(6)
    const [totalItems, setTotalItems] = useState(0)

    const fetchLabs = useCallback(async () => {
        if (!classId) {
            setErrorLabs("No class ID available")
            setLoadingLabs(false)
            return
        }

        try {
            setLoadingLabs(true)
            setErrorLabs(null)
            const response = await getLabByClassById(parseInt(classId, 10))
            if (response) {
                const activeLabs = response.pageData.filter((lab: Lab) => lab.labStatus === "Active")
                setLabs(activeLabs)
                setTotalItems(activeLabs.length)
            } else {
                throw new Error(response.message)
            }
        } catch (err: any) {
            const errorMessage = err.message || "Failed to fetch labs"
            setErrorLabs(errorMessage)
            console.error("Error fetching labs:", err)
            setLabs([])
        } finally {
            setLoadingLabs(false)
        }
    }, [classId, pageNum, pageSize])

    useEffect(() => {
        fetchLabs()
    }, [fetchLabs])

    const handlePaginationChange = (page: number, pageSize: number | undefined) => {
        setPageNum(page)
        setPageSize(pageSize || 6)
    }

    return (
        <div className="space-y-6">
            {loadingLabs ? (
                <div className="p-12 text-center text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
                    <p>Loading labs...</p>
                </div>
            ) : errorLabs ? (
                <div className="p-8 text-center text-red-500 font-medium">
                    <p>{errorLabs}</p>
                </div>
            ) : labs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    <p>No active labs found for this class.</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {labs.map((lab) => (
                            <Card
                                key={lab.labId}
                                className="flex flex-col border shadow-md hover:shadow-xl transition rounded-2xl"
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">{lab.labName}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="w-4 h-4 text-blue-500" />
                                        <span className="flex-1 truncate max-w-[220px]">
                                            <span className="font-semibold">Request:</span> {lab.labRequest}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-green-500" />
                                        <span className="flex-1 truncate max-w-[220px]">
                                            <span className="font-semibold">Target:</span> {lab.labTarget}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-orange-500" />
                                        <span className="flex-1 truncate max-w-[220px]">
                                            <span className="font-semibold">Equipments:</span>{" "}
                                            {lab.requiredEquipments.length > 0
                                                ? lab.requiredEquipments
                                                    .map((eq) => eq.equipmentTypeName || eq.equipmentTypeId)
                                                    .join(", ")
                                                : "None"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-pink-500" />
                                        <span className="flex-1 truncate max-w-[220px]">
                                            <span className="font-semibold">Kits:</span>{" "}
                                            {lab.requiredKits.length > 0
                                                ? lab.requiredKits.map((kit) => kit.kitTemplateName || kit.kitTemplateId).join(", ")
                                                : "None"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-center mt-8">
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
                </>
            )}
        </div>
    )
}