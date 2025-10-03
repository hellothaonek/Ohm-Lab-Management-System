"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ClipboardList, Target, Cpu, Package, FlaskConical, FileSpreadsheet } from "lucide-react"
import { getLabByClassById } from "@/services/labServices"
import { Pagination } from "antd"
import LabDetail from "./LabDetail"

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
    const [selectedLabId, setSelectedLabId] = useState<number | null>(null) // State to track selected lab

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
            if (response && response.pageData) {
                const activeLabs = response.pageData.filter((lab: Lab) => lab.labStatus === "Active")
                setLabs(activeLabs)
                setTotalItems(activeLabs.length)
            } else {
                throw new Error(response?.message || "Received an invalid response structure from API.")
            }
        } catch (err: any) {
            const errorMessage = err.message || "Failed to fetch labs"
            setErrorLabs(errorMessage)
            console.error("Error fetching labs:", err)
            setLabs([])
        } finally {
            setLoadingLabs(false)
        }
    }, [classId])

    useEffect(() => {
        fetchLabs()
    }, [fetchLabs])

    const handlePaginationChange = (page: number, size: number | undefined) => {
        setPageNum(page)
        setPageSize(size || 6)
    }

    // Handle View Lab Now button click
    const handleViewLab = (labId: number) => {
        setSelectedLabId(labId)
    }

    // Close LabDetail
    const handleCloseLabDetail = () => {
        setSelectedLabId(null)
    }

    // Client-side pagination logic
    const startIndex = (pageNum - 1) * pageSize
    const paginatedLabs = labs.slice(startIndex, startIndex + pageSize)

    return (
        <div className="space-y-8">
            {/* Conditionally render LabDetail */}
            {selectedLabId && (
                <LabDetail
                    labId={selectedLabId}
                    open={!!selectedLabId}
                    onClose={handleCloseLabDetail}
                />
            )}

            {/* Loading, Error, Empty State */}
            {loadingLabs ? (
                <div className="p-12 text-center text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
                    <p>Loading lab list...</p>
                </div>
            ) : errorLabs ? (
                <div className="p-8 text-center text-red-500 font-medium border border-red-200 bg-red-50 rounded-lg">
                    <p>Error loading labs: {errorLabs}</p>
                </div>
            ) : labs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                    <p>No active labs found for this class.</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {paginatedLabs.map((lab) => (
                            <Card
                                key={lab.labId}
                                className="flex flex-col border border-gray-200 shadow-lg hover:shadow-xl transition duration-300 rounded-xl overflow-hidden"
                            >
                                <CardHeader className="bg-green-50 border-b border-green-200 p-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl font-bold text-green-700 leading-tight pr-4 flex items-center">
                                            <FileSpreadsheet className="w-6 h-6 mr-2 flex-shrink-0 text-green-600" />
                                            <span className="line-clamp-2">{lab.labName}</span>
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4 p-5">
                                    <div className="space-y-1 pb-3 border-b border-dashed border-gray-200">
                                        <h3 className="text-base font-semibold text-gray-800">Lab Practice Content</h3>
                                        <div className="flex items-start text-sm pb-1 pt-1">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-red-700">Requirement:</span>
                                                <span className="text-gray-600 break-words line-clamp-2">{lab.labRequest}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start text-sm pb-1 pt-1">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-blue-700">Objective:</span>
                                                <span className="text-gray-600 break-words line-clamp-2">{lab.labTarget || "Not specified"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pt-3">
                                        <h3 className="text-base font-semibold text-gray-800">Required Equipment & Kits</h3>
                                        <div className="flex items-start text-sm pb-1 pt-1">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-yellow-700">Equipment:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {lab.requiredEquipments.length > 0 ? (
                                                        <>
                                                            {lab.requiredEquipments.slice(0, 2).map((eq) => (
                                                                <Badge
                                                                    key={eq.equipmentTypeId}
                                                                    className="bg-green-100 text-green-800 font-medium"
                                                                >
                                                                    {eq.equipmentTypeName || eq.equipmentTypeId}
                                                                </Badge>
                                                            ))}
                                                            {lab.requiredEquipments.length > 2 && (
                                                                <Badge className="bg-gray-100 text-gray-800 font-medium">
                                                                    +{lab.requiredEquipments.length - 2}
                                                                </Badge>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-600">...</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start text-sm pb-1 pt-1">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-yellow-700">Kit:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {lab.requiredKits.length > 0 ? (
                                                        <>
                                                            {lab.requiredKits.slice(0, 2).map((kit) => (
                                                                <Badge
                                                                    key={kit.kitTemplateId}
                                                                    className="bg-green-100 text-green-800 font-medium"
                                                                >
                                                                    {kit.kitTemplateName || kit.kitTemplateId}
                                                                </Badge>
                                                            ))}
                                                            {lab.requiredKits.length > 2 && (
                                                                <Badge className="bg-gray-100 text-gray-800 font-medium">
                                                                    +{lab.requiredKits.length - 2}
                                                                </Badge>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-600">...</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 border-t border-gray-100">
                                    <Button
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition"
                                        onClick={() => handleViewLab(lab.labId)}
                                    >
                                        View Lab Now
                                    </Button>
                                </div>
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
                            pageSizeOptions={['6', '12', '18', '24']}
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