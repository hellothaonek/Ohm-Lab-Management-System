"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, BookOpen, Loader2, EllipsisVertical, CalendarPlus, UsersRound, UserPen, Trash2, Edit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getAllClasses } from "@/services/classServices"
import CreateNewClass from "@/components/head/classes/CreateNewClass"
import DeleteClass from "@/components/head/classes/DeleteClass"
import EditClass from "@/components/head/classes/EditClass"
import AddSchedule from "@/components/head/classes/AddSchedule"
import AddStudent from "@/components/head/classes/AddStudent"
import Link from "next/link"

interface ClassItem {
    classId: number
    subjectId: number
    lecturerId: number | null
    scheduleTypeId: number | null
    className: string
    classDescription: string
    classStatus: string
    subjectName: string
    lecturerName: string | null
    classUsers: any[]
    semesterName: string
    scheduleTypeDow?: string
    slotStartTime?: string
    slotEndTime?: string
}

export default function HeadClassesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSemester, setSelectedSemester] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingClass, setEditingClass] = useState<ClassItem | null>(null)
    const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [addingScheduleClass, setAddingScheduleClass] = useState<ClassItem | null>(null)
    const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false)
    const [addingStudentClass, setAddingStudentClass] = useState<ClassItem | null>(null)
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)

    const fetchClasses = async () => {
        try {
            setLoading(true)
            const response = await getAllClasses("active")
            setClasses(response.pageData)
        } catch (err) {
            setError("Failed to fetch classes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClasses()
    }, [])

    const semesters = useMemo(() => {
        const semesterMap = new Map<string, { value: string; label: string }>()
        classes.forEach((classItem) => {
            semesterMap.set(classItem.semesterName, {
                value: classItem.semesterName,
                label: classItem.semesterName,
            })
        })
        return [
            { value: "all", label: "All Semesters" },
            ...Array.from(semesterMap.values()),
        ]
    }, [classes])

    const statusOptions = useMemo(() => {
        const uniqueStatuses = [...new Set(classes.map((classItem) => classItem.classStatus))]
        return [
            { value: "all", label: "All Status" },
            ...uniqueStatuses.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
        ]
    }, [classes])

    const filteredClasses = useMemo(() => {
        return classes.filter((classItem) => {
            const matchesSearch =
                classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSemester = selectedSemester === "all" || classItem.semesterName === selectedSemester
            const matchesStatus = selectedStatus === "all" || classItem.classStatus === selectedStatus

            return matchesSearch && matchesSemester && matchesStatus
        })
    }, [searchTerm, selectedSemester, selectedStatus, classes])

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "valid":
                return "default"
            default:
                return "outline"
        }
    }

    const handleCreateClass = (newClass: ClassItem) => {
        setClasses((prev) => [...prev, {
            ...newClass,
            subjectName: newClass.subjectName || "-",
            lecturerName: newClass.lecturerName || "-",
            semesterName: newClass.semesterName || "-",
            scheduleTypeDow: newClass.scheduleTypeDow || "-",
            slotStartTime: newClass.slotStartTime || "-",
            slotEndTime: newClass.slotEndTime || "-",
            classUsers: newClass.classUsers || [],
        }])
    }

    const handleDeleteClass = () => {
        fetchClasses()
    }

    const handleAddSchedule = (schedule: { scheduleTypeId: number; classId: number }) => {
        fetchClasses()
    }

    const handleAddStudents = (classId: number, file: File) => {
        // In a real implementation, you would make an API call to upload the file
        // and process the student data, then refresh the classes
        console.log(`Uploading file for class ${classId}:`, file.name)
        fetchClasses()
    }

    const renderTableView = () => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Lecturer</TableHead>
                            <TableHead>Day of Week</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClasses.map((classItem) => (
                            <TableRow key={classItem.classId}>
                                <TableCell>
                                    <Link href={`/head/dashboard/classes/[class-detail]?classId=${classItem.classId}`} as={`/head/dashboard/classes/class-detail?classId=${classItem.classId}`} className="font-medium text-orange-500 hover:underline">
                                        {classItem.className}
                                    </Link>
                                </TableCell>
                                <TableCell>{classItem.subjectName || "-"}</TableCell>
                                <TableCell>{classItem.lecturerName || "-"}</TableCell>
                                <TableCell>{classItem.scheduleTypeDow || "-"}</TableCell>
                                <TableCell>
                                    {classItem.slotStartTime && classItem.slotEndTime
                                        ? `${classItem.slotStartTime}-${classItem.slotEndTime}`
                                        : "-"}
                                </TableCell>
                                <TableCell>{classItem.semesterName || "-"}</TableCell>
                                <TableCell>{classItem.classUsers.length}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(classItem.classStatus)}>{classItem.classStatus}</Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost" title="Actions" aria-label={`Actions for ${classItem.className}`}>
                                                <EllipsisVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => setEditingClass(classItem)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setDeletingClass(classItem)
                                                    setIsDeleteModalOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setAddingScheduleClass(classItem)
                                                    setIsAddScheduleModalOpen(true)
                                                }}
                                            >
                                                <CalendarPlus className="h-4 w-4 mr-2" />
                                                Add Schedule
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setAddingStudentClass(classItem)
                                                    setIsAddStudentModalOpen(true)
                                                }}
                                            >
                                                <UsersRound className="h-4 w-4 mr-2" />
                                                Add Student List
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )

    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <Card>
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen p-4">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{error}</h3>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Classes</h1>
                    </div>
                    <CreateNewClass onCreateClass={handleCreateClass} />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-label="Search icon" />
                        <Input
                            placeholder="Search by class name or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-64">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {semesters.map((semester) => (
                                <SelectItem key={semester.value} value={semester.value}>
                                    {semester.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-40">
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
            </div>

            {editingClass && (
                <EditClass
                    classItem={editingClass}
                    open={!!editingClass}
                    onClose={() => setEditingClass(null)}
                    onUpdate={(updatedClass) => {
                        setClasses((prev) =>
                            prev.map((c) => (c.classId === updatedClass.classId ? {
                                ...c,
                                ...updatedClass,
                                classUsers: c.classUsers,
                                semesterName: c.semesterName,
                            } : c))
                        )
                        setEditingClass(null)
                    }}
                />
            )}

            {deletingClass && (
                <DeleteClass
                    open={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false)
                        setDeletingClass(null)
                    }}
                    onDelete={handleDeleteClass}
                    classId={deletingClass.classId.toString()}
                    className={deletingClass.className}
                />
            )}

            {addingScheduleClass && (
                <AddSchedule
                    open={isAddScheduleModalOpen}
                    onClose={() => {
                        setIsAddScheduleModalOpen(false)
                        setAddingScheduleClass(null)
                    }}
                    onAddSchedule={handleAddSchedule}
                    classId={addingScheduleClass.classId}
                    className={addingScheduleClass.className}
                />
            )}

            {addingStudentClass && (
                <AddStudent
                    open={isAddStudentModalOpen}
                    onClose={() => {
                        setIsAddStudentModalOpen(false)
                        setAddingStudentClass(null)
                    }}
                    onAddStudents={handleAddStudents}
                    classId={addingStudentClass.classId}
                    className={addingStudentClass.className}
                />
            )}

            {filteredClasses.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search criteria.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                renderTableView()
            )}
        </div>
    )
}