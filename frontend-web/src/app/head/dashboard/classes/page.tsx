"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, BookOpen, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DashboardLayout from "@/components/dashboard-layout"
import CreateNewClass from "@/components/head/classes/CreateNewClass"
import { getAllClasses } from "@/services/classServices"

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
}

export default function LecturerClassesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSubject, setSelectedSubject] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch classes data from API
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true)
                const response = await getAllClasses()
                console.log("API GET CLASS:", response)
                setClasses(response)
            } catch (err) {
                setError("Failed to fetch classes")
            } finally {
                setLoading(false)
            }
        }
        fetchClasses()
    }, [])

    // Derive subjects and status options dynamically from API data
    const subjects = useMemo(() => {
        const uniqueSubjects = [
            ...new Set(classes.map((classItem) => ({
                value: classItem.subjectId.toString(),
                label: classItem.subjectName,
            }))),
        ]
        return [{ value: "all", label: "All Subjects" }, ...uniqueSubjects]
    }, [classes])

    const statusOptions = useMemo(() => {
        const uniqueStatuses = [...new Set(classes.map((classItem) => classItem.classStatus))]
        return [
            { value: "all", label: "All Status" },
            ...uniqueStatuses.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
        ]
    }, [classes])

    // Filter classes based on search and select inputs
    const filteredClasses = useMemo(() => {
        return classes.filter((classItem) => {
            const matchesSearch =
                classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSubject = selectedSubject === "all" || classItem.subjectId.toString() === selectedSubject
            const matchesStatus = selectedStatus === "all" || classItem.classStatus === selectedStatus

            return matchesSearch && matchesSubject && matchesStatus
        })
    }, [searchTerm, selectedSubject, selectedStatus, classes])

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "valid":
                return "default"
            default:
                return "outline"
        }
    }

    const handleCreateClass = (newClass: ClassItem) => {
        setClasses((prev) => [...prev, newClass])
    }

    const handleEditClass = (classItem: ClassItem) => {
        // Placeholder for edit functionality
        console.log("Edit class:", classItem)
        // Implement actual edit logic here (e.g., open a modal or navigate to an edit page)
    }

    const handleDeleteClass = (classId: number) => {
        // Placeholder for delete functionality
        console.log("Delete class with ID:", classId)
        // Implement actual delete logic here (e.g., call API to delete and update state)
        setClasses((prev) => prev.filter((classItem) => classItem.classId !== classId))
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
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClasses.map((classItem) => (
                            <TableRow key={classItem.classId}>
                                <TableCell className="font-medium text-orange-500">{classItem.className}</TableCell>
                                <TableCell>{classItem.subjectName}</TableCell>
                                <TableCell>{classItem.lecturerName || "N/A"}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(classItem.classStatus)}>{classItem.classStatus}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEditClass(classItem)}
                                            title="Edit class"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDeleteClass(classItem.classId)}
                                            title="Delete class"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
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
            <DashboardLayout role="lecturer">
                <div className="min-h-screen p-4">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading classes...</h3>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout role="lecturer">
                <div className="min-h-screen p-4">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{error}</h3>
                            <Button onClick={() => window.location.reload()}>Retry</Button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="lecturer">
            <div className="min-h-screen p-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Classes Management</h1>
                        </div>
                        <CreateNewClass onCreateClass={handleCreateClass} />
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by class name or subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="w-64">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.value} value={subject.value}>
                                        {subject.label}
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

                {/* Results */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {filteredClasses.length} of {classes.length} classes
                    </p>
                </div>

                {/* Classes Display */}
                {filteredClasses.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes found</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Try adjusting your search criteria or create a new class.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    renderTableView()
                )}
            </div>
        </DashboardLayout>
    )
}