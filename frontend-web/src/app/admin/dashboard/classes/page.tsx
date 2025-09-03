"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Badge } from "../../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Edit, Trash2, Search } from "lucide-react"
import { getAllClasses } from "../../../../services/classServices"
import { getSubjects } from "../../../../services/courseServices"
import CreateClass from "../../../../components/admin/classes/CreateClass"
import EditClass from "../../../../components/admin/classes/EditClass"
import DeleteClass from "../../../../components/admin/classes/DeleteClass"
import { Class, Subject } from "../../../../types/class"
import { toast } from "react-toastify"

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<Class[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState<Class | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [classesData, subjectsData] = await Promise.all([
                getAllClasses(),
                getSubjects()
            ])

            
            // Handle classes data - check if it's an array or has a pageData property
            if (Array.isArray(classesData)) {
                setClasses(classesData)
            } else if (classesData && classesData.pageData && Array.isArray(classesData.pageData)) {
                setClasses(classesData.pageData)
            } else if (classesData && classesData.data && Array.isArray(classesData.data)) {
                setClasses(classesData.data)
            } else if (classesData && classesData.classes && Array.isArray(classesData.classes)) {
                setClasses(classesData.classes)
            } else {
                setClasses([])
            }
            
            // Handle subjects data - check if it's an array or has a data property
            if (Array.isArray(subjectsData)) {
                setSubjects(subjectsData)
            } else if (subjectsData && subjectsData.data && Array.isArray(subjectsData.data)) {
                setSubjects(subjectsData.data)
            } else if (subjectsData && subjectsData.subjects && Array.isArray(subjectsData.subjects)) {
                setSubjects(subjectsData.subjects)
            } else {
                setSubjects([])
            }
        } catch (error) {
            toast.error("Failed to fetch data")
            console.error("Error fetching data:", error)
            setClasses([])
            setSubjects([])
        } finally {
            setLoading(false)
        }
    }

    const handleSuccess = () => {
        fetchData()
    }

    const openEditDialog = (classItem: Class) => {
        setSelectedClass(classItem)
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (classItem: Class) => {
        setSelectedClass(classItem)
        setIsDeleteDialogOpen(true)
    }

    const filteredClasses = (classes || []).filter(classItem => {
        const matchesSearch = classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             classItem.classDescription.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || classItem.classStatus === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Active":
                return "default"
            case "Inactive":
                return "destructive"
            default:
                return "secondary"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
                    <p className="text-muted-foreground">
                        Manage all classes in the system
                    </p>
                </div>
                <CreateClass subjects={subjects} onSuccess={handleSuccess} />
            </div>
            
            {(!subjects || subjects.length === 0) && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-amber-600">
                            <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                            <p className="text-sm">
                                No subjects available. Please create subjects first before creating classes.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by class name or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Classes Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Classes</CardTitle>
                    <CardDescription>
                        {filteredClasses.length} classes found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClasses.map((classItem) => (
                                <TableRow key={classItem.classId}>
                                    <TableCell className="font-medium">{classItem.className}</TableCell>
                                    <TableCell>{classItem.subjectName || "N/A"}</TableCell>
                                    <TableCell className="max-w-xs truncate">{classItem.classDescription}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(classItem.classStatus)}>
                                            {classItem.classStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{classItem.classUsers?.length || 0}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(classItem)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openDeleteDialog(classItem)}
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

            {/* Edit Dialog */}
            <EditClass
                classItem={selectedClass}
                subjects={subjects}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={handleSuccess}
            />

            {/* Delete Dialog */}
            <DeleteClass
                classItem={selectedClass}
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
