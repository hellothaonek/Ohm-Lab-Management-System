"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Search, BookOpen, Loader2, EllipsisVertical, CalendarPlus, UsersRound, Trash2, Edit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CreateNewClass from "@/components/head/classes/CreateNewClass"
import DeleteClass from "@/components/head/classes/DeleteClass"
import EditClass from "@/components/head/classes/EditClass"
import AddSchedule from "@/components/head/classes/AddSchedule"
import AddStudent from "@/components/head/classes/AddStudent"
import Link from "next/link"
import { getAllClasses } from "@/services/classServices"
import { Pagination } from 'antd'

interface ClassUser {
    classUserId: number;
    classId: number;
    userId: string;
    className: string;
    userName: string;
    userEmail: string;
    userRole: string;
    userNumberCode: string;
    subjectId: number;
    subjectName: string;
    subjectCode: string;
    subjectDescription: string;
    subjectStatus: string;
    semesterName: string | null;
    semesterStartDate: string | null;
    semesterEndDate: string | null;
    classUserStatus: string;
}

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
    classUsers: ClassUser[]
    semesterName: string | null
    scheduleTypeDow?: string
    slotStartTime?: string
    slotEndTime?: string
}

export default function HeadClassesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all") // New state for status filter
    const [rawClassesData, setRawClassesData] = useState<ClassItem[]>([])
    const [allClassesData, setAllClassesData] = useState<ClassItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingClass, setEditingClass] = useState<ClassItem | null>(null)
    const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [addingScheduleClass, setAddingScheduleClass] = useState<ClassItem | null>(null)
    const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false)
    const [addingStudentClass, setAddingStudentClass] = useState<ClassItem | null>(null)
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const fetchClasses = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await getAllClasses()
            const filteredData = response.pageData.filter((classItem: ClassItem) => {
                const status = classItem.classStatus?.toLowerCase()
                return status === 'active' || status === 'inactive'
            })
            setRawClassesData(filteredData)
            setPageNum(1)
        } catch (err) {
            console.error("Failed to fetch classes:", err)
            setError("Failed to load classes. Please try again.")
            setRawClassesData([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchClasses()
    }, [fetchClasses])

    const filteredAndPaginatedData = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim()

        // 1. Filtering: Lọc trên TẤT CẢ dữ liệu
        const filtered = rawClassesData.filter((classItem) => {
            const matchesSearch = (
                classItem.className.toLowerCase().includes(lowerCaseSearchTerm) ||
                classItem.subjectName.toLowerCase().includes(lowerCaseSearchTerm) ||
                classItem.lecturerName?.toLowerCase().includes(lowerCaseSearchTerm) ||
                classItem.semesterName?.toLowerCase().includes(lowerCaseSearchTerm)
            )

            const matchesStatus = statusFilter === "all" ||
                classItem.classStatus.toLowerCase() === statusFilter.toLowerCase()

            return matchesSearch && matchesStatus
        })

        // 2. Pagination: Cắt lát dữ liệu đã lọc
        const startIndex = (pageNum - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginated = filtered.slice(startIndex, endIndex)

        setAllClassesData(paginated)
        return filtered.length
    }, [rawClassesData, searchTerm, statusFilter, pageNum, pageSize])

    const totalFilteredItems = filteredAndPaginatedData

    const handlePaginationChange = (page: number, size: number) => {
        setPageNum(page)
        if (size !== pageSize) {
            setPageSize(size)
            setPageNum(1)
        }
    }

    const handleCreateClass = () => { fetchClasses() }
    const handleDeleteClass = () => {
        setIsDeleteModalOpen(false)
        setDeletingClass(null)
        fetchClasses()
    }
    const handleAddSchedule = () => {
        setIsAddScheduleModalOpen(false)
        setAddingScheduleClass(null)
        fetchClasses()
    }
    const handleAddStudents = () => {
        setIsAddStudentModalOpen(false)
        setAddingStudentClass(null)
        fetchClasses()
    }
    const handleUpdateClass = () => {
        setEditingClass(null)
        fetchClasses()
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPageNum(1)
    }

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setPageNum(1)
    }

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
            case "valid":
                return "default"
            case "inactive":
                return "secondary"
            default:
                return "outline"
        }
    }

    const renderTableView = () => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-blue-100">
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
                        {allClassesData.map((classItem) => (
                            <TableRow key={classItem.classId}>
                                <TableCell>
                                    <Link href={`/head/dashboard/classes/[class-detail]?classId=${classItem.classId}`} as={`/head/dashboard/classes/class-detail?classId=${classItem.classId}`} className="font-medium hover:text-orange-500">
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
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading classes...</h3>
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
                        <h3 className="text-lg font-medium text-red-500 mb-2">Error</h3>
                        <p className="text-gray-600 dark:text-gray-400">{error}</p>
                        <Button onClick={fetchClasses} className="mt-4">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    let noContentMessage = null
    const isSearchActive = searchTerm.trim() !== "" || statusFilter !== "all"

    if (totalFilteredItems === 0 && isSearchActive) {
        noContentMessage = {
            icon: <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />,
            heading: `No classes found matching your criteria`,
            paragraph: "Try adjusting your search or status filter.",
        }
    } else if (rawClassesData.length === 0 && !isSearchActive) {
        noContentMessage = {
            icon: <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />,
            heading: "No classes available",
            paragraph: "Create a new class to get started.",
        }
    }

    return (
        <div className="min-h-screen p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Classes</h1>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-label="Search icon" />
                        <Input
                            placeholder="Search by class name, subject, or lecturer..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full sm:w-40">
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:ml-auto">
                        <CreateNewClass onCreateClass={handleCreateClass} />
                    </div>
                </div>
            </div>

            {editingClass && (
                <EditClass
                    classItem={editingClass}
                    open={!!editingClass}
                    onClose={() => setEditingClass(null)}
                    onUpdate={handleUpdateClass}
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

            {noContentMessage ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        {noContentMessage.icon}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {noContentMessage.heading}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {noContentMessage.paragraph}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {renderTableView()}
                    {totalFilteredItems > 0 && (
                        <div className="mt-6 flex justify-end">
                            <Pagination
                                current={pageNum}
                                pageSize={pageSize}
                                total={totalFilteredItems}
                                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} classes`}
                                onChange={handlePaginationChange}
                                showSizeChanger
                                onShowSizeChange={handlePaginationChange}
                                pageSizeOptions={['10', '20', '50', '100']}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}