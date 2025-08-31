"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Target, ClipboardList, Cpu, Package, Clock, Pencil, Trash2, MoreVertical, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Pagination } from "antd"
import { getLabBySubjectId } from "@/services/labServices"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import LabDetail from "@/components/head/lab/LabDetail"
import EditLab from "@/components/head/lab/EditLab"
import DeleteLab from "@/components/head/lab/DeleteLab"
import CreateLab from "@/components/head/lab/CreateLab"

interface Equipment {
    equipmentTypeId: string
    equipmentTypeName: string
}

interface Kit {
    kitTemplateId: string
    kitTemplateName: string
}

interface Lab {
    labId: number
    subjectId: number
    labName: string
    labRequest: string
    labTarget: string
    labStatus: string
    requiredEquipments: {
        equipmentTypeId: string
        equipmentTypeName?: string // Optional, as it may come from API
    }[]
    requiredKits: {
        kitTemplateId: string
        kitTemplateName?: string // Optional, as it may come from API
    }[]
}

export default function CourseDetailPage() {
    const searchParams = useSearchParams()
    const subjectIdParam = searchParams.get("subjectId")
    const subjectId = subjectIdParam ? parseInt(subjectIdParam) : null
    const [labs, setLabs] = useState<Lab[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(6)
    const [totalItems, setTotalItems] = useState(0)
    const [selectedLabId, setSelectedLabId] = useState<number | null>(null)
    const [openDetail, setOpenDetail] = useState(false)
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null)
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [openCreate, setOpenCreate] = useState(false)

    const fetchLabs = useCallback(async () => {
        if (!subjectId) {
            setError("No subject ID provided")
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            const response = await getLabBySubjectId(subjectId.toString())
            if (response) {
                const activeLabs = response.pageData.filter((lab: Lab) => lab.labStatus === "Active")
                setLabs(activeLabs)
                setTotalItems(activeLabs.length)
            } else {
                throw new Error(response.message)
            }
        } catch (err: any) {
            const errorMessage = err.message || "Failed to fetch labs"
            setError(errorMessage)
            console.error("Error fetching labs:", err)
            setLabs([])
        } finally {
            setIsLoading(false)
        }
    }, [subjectId, pageNum, pageSize])

    useEffect(() => {
        fetchLabs()
    }, [fetchLabs])

    const handlePaginationChange = (page: number, pageSize: number | undefined) => {
        setPageNum(page)
        setPageSize(pageSize || 6)
    }

    const handleEditLab = (lab: Lab) => {
        setSelectedLab(lab)
        setOpenEdit(true)
    }

    const handleEditClose = () => {
        setOpenEdit(false)
        setSelectedLab(null)
    }

    const handleEditUpdate = () => {
        fetchLabs()
        handleEditClose()
    }

    const handleDeleteLab = (lab: Lab) => {
        setSelectedLab(lab)
        setOpenDelete(true)
    }

    const handleDeleteClose = () => {
        setOpenDelete(false)
        setSelectedLab(null)
    }

    const handleDeleteSuccess = () => {
        fetchLabs()
        handleDeleteClose()
    }

    const handleLabCreated = (newLab: Lab) => {
        fetchLabs()
        setOpenCreate(false)
    }

    return (
        <div className="space-y-6">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold">Course Labs</CardTitle>
                        <CardDescription>Explore all labs available for this course</CardDescription>
                    </div>
                    <div className="flex justify-end items-end">
                        <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => setOpenCreate(true)}
                            disabled={!subjectId}
                        >
                            Create Lab
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
                        <p>Loading labs...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 font-medium">
                        <p>{error}</p>
                    </div>
                ) : labs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No active labs found for this course.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {labs.map((lab) => (
                                <Card
                                    key={lab.labId}
                                    className="flex flex-col border shadow-md hover:shadow-xl transition rounded-2xl"
                                    onClick={() => {
                                        setSelectedLabId(lab.labId)
                                        setOpenDetail(true)
                                    }}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg font-semibold">{lab.labName}</CardTitle>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-5 h-5 text-orange-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleEditLab(lab)
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4 mr-2 text-green-600" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteLab(lab)
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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
                                                    ? lab.requiredEquipments.map((eq) => eq.equipmentTypeName || eq.equipmentTypeId).join(", ")
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

                        <LabDetail
                            labId={selectedLabId}
                            open={openDetail}
                            onClose={() => setOpenDetail(false)}
                        />

                        <EditLab
                            lab={selectedLab}
                            open={openEdit}
                            onClose={handleEditClose}
                            onUpdate={handleEditUpdate}
                        />

                        <DeleteLab
                            lab={selectedLab}
                            open={openDelete}
                            onClose={handleDeleteClose}
                            onDelete={handleDeleteSuccess}
                        />

                        {subjectId !== null && (
                            <CreateLab
                                subjectId={subjectId}
                                isOpen={openCreate}
                                onClose={() => setOpenCreate(false)}
                                onLabCreated={handleLabCreated}
                            />
                        )}

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
            </CardContent>
        </div>
    )
}