"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Edit,
    Trash2,
    Plus,
    FlaskConical,
    Target,
    FileText,
    RefreshCw,
    MoreHorizontal,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getLabsBySubjectId } from "@/services/courseServices"
import CreateLab from "./CreateLab"
import DeleteLab from "./DeleteLab"
import EditLab from "./EditLab"

interface Lab {
    subjectId?: number
    labId?: string
    labName: string
    labRequest: string
    labTarget: string
    labStatus?: string
}

interface CourseLabProps {
    subjectId: number
}

const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
        case "completed":
        case "active":
            return "default"
        case "pending":
        case "in progress":
            return "secondary"
        case "inactive":
        case "cancelled":
            return "destructive"
        default:
            return "outline"
    }
}

const CourseLab: React.FC<CourseLabProps> = ({ subjectId }) => {
    const [labs, setLabs] = useState<Lab[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null)

    const fetchLabs = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await getLabsBySubjectId(subjectId.toString())
            if (response) {
                setLabs(response.pageData)
            } else {
                throw new Error("Invalid API response: Expected an array in data.pageData field")
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch labs"
            setError(errorMessage)
            console.error("Error fetching labs:", err)
            setLabs([])
        } finally {
            setIsLoading(false)
        }
    }, [subjectId])

    useEffect(() => {
        fetchLabs()
    }, [fetchLabs])

    const handleNewLab = () => {
        setIsModalOpen(true)
    }

    const handleLabCreated = async (newLab: Lab) => {
        await fetchLabs()
        setIsModalOpen(false)
    }

    const handleEditClick = (lab: Lab) => {
        setSelectedLab(lab)
        setIsEditModalOpen(true)
    }

    const handleLabUpdated = async (updatedLab: Lab) => {
        await fetchLabs()
        setIsEditModalOpen(false)
        setSelectedLab(null)
    }

    const handleDeleteClick = (lab: Lab) => {
        setSelectedLab(lab)
        setIsDeleteModalOpen(true)
    }

    const handleLabDeleted = async (labId: string) => {
        await fetchLabs()
        setIsDeleteModalOpen(false)
        setSelectedLab(null)
    }


    return (
        <div className="space-y-6">

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-orange-600" />
                    <CardTitle>Course Lab</CardTitle>
                </div>
                {labs.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button onClick={handleNewLab} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                            New Lab
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading laboratory sessions...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                            <FlaskConical className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
                        <Button onClick={fetchLabs} variant="outline" size="sm">
                            Try Again
                        </Button>
                    </div>
                ) : labs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <FlaskConical className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-center mb-2">No laboratory sessions yet</p>
                        <p className="text-sm text-muted-foreground mb-4">Create your first lab to get started</p>
                        <Button onClick={handleNewLab} className="flex items-center gap-2">
                            Create Lab
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Lab Name
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Request
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            Target
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labs.map((lab, index) => (
                                    <TableRow key={lab.labId || index} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                                    <FlaskConical className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <span className="font-semibold">{lab.labName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <p className="text-sm text-muted-foreground line-clamp-2">{lab.labRequest}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <p className="text-sm text-muted-foreground line-clamp-2">{lab.labTarget}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(lab.labStatus)} className="flex items-center gap-1 w-fit">
                                                {lab.labStatus || "Pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditClick(lab)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Lab
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(lab)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Lab
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            <CreateLab
                subjectId={subjectId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLabCreated={handleLabCreated}
            />
            {selectedLab && (
                <EditLab
                    labId={selectedLab.labId!}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setSelectedLab(null)
                    }}
                    onLabUpdated={handleLabUpdated}
                />
            )}
            {selectedLab && (
                <DeleteLab
                    labId={selectedLab.labId}
                    labName={selectedLab.labName}
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false)
                        setSelectedLab(null)
                    }}
                    onLabDeleted={handleLabDeleted}
                />
            )}
        </div>
    )
}

export default CourseLab
