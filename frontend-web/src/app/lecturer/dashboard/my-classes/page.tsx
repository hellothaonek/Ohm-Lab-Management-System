"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { CircuitBoard, Search, Users, Calendar, BookOpen, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"

// Sample classes data
const classesData = [
    {
        id: 1,
        subjectName: "Digital Electronics",
        subjectCode: "ELE301",
        classCode: "ELE301.01",
        semester: "Fall 2024",
        students: 25,
        maxStudents: 30,
        status: "active",
        createdDate: "2024-08-15",
        room: "Lab A-301",
        schedule: "Mon, Wed 08:00-10:00",
    },
    {
        id: 2,
        subjectName: "Advanced Circuit Design",
        subjectCode: "ELE405",
        classCode: "ELE405.02",
        semester: "Fall 2024",
        students: 20,
        maxStudents: 25,
        status: "active",
        createdDate: "2024-08-20",
        room: "Lab B-205",
        schedule: "Tue, Thu 14:00-16:00",
    },
    {
        id: 3,
        subjectName: "Software Engineering",
        subjectCode: "SE1806",
        classCode: "SE1806.03",
        semester: "Fall 2024",
        students: 30,
        maxStudents: 35,
        status: "active",
        createdDate: "2024-08-10",
        room: "Lab C-102",
        schedule: "Wed, Fri 10:00-12:00",
    },
    {
        id: 4,
        subjectName: "Digital Electronics",
        subjectCode: "ELE301",
        classCode: "ELE301.02",
        semester: "Fall 2024",
        students: 28,
        maxStudents: 30,
        status: "active",
        createdDate: "2024-08-18",
        room: "Lab A-302",
        schedule: "Tue, Thu 08:00-10:00",
    },
    {
        id: 5,
        subjectName: "Microprocessor Systems",
        subjectCode: "ELE402",
        classCode: "ELE402.01",
        semester: "Fall 2024",
        students: 22,
        maxStudents: 25,
        status: "pending",
        createdDate: "2024-09-01",
        room: "Lab D-101",
        schedule: "Mon, Wed 14:00-16:00",
    },
    {
        id: 6,
        subjectName: "Advanced Circuit Design",
        subjectCode: "ELE405",
        classCode: "ELE405.01",
        semester: "Summer 2024",
        students: 18,
        maxStudents: 20,
        status: "completed",
        createdDate: "2024-05-15",
        room: "Lab B-203",
        schedule: "Mon-Fri 09:00-11:00",
    },
    {
        id: 7,
        subjectName: "Embedded Systems",
        subjectCode: "ELE501",
        classCode: "ELE501.01",
        semester: "Fall 2024",
        students: 15,
        maxStudents: 20,
        status: "active",
        createdDate: "2024-08-25",
        room: "Lab E-201",
        schedule: "Wed, Fri 14:00-16:00",
    },
    {
        id: 8,
        subjectName: "Software Engineering",
        subjectCode: "SE1806",
        classCode: "SE1806.01",
        semester: "Summer 2024",
        students: 25,
        maxStudents: 30,
        status: "completed",
        createdDate: "2024-05-10",
        room: "Lab C-101",
        schedule: "Mon-Thu 10:00-12:00",
    },
]

const subjects = [
    { value: "all", label: "All Subjects" },
    { value: "ELE301", label: "ELE301 - Digital Electronics" },
    { value: "ELE405", label: "ELE405 - Advanced Circuit Design" },
    { value: "SE1806", label: "SE1806 - Software Engineering" },
    { value: "ELE402", label: "ELE402 - Microprocessor Systems" },
    { value: "ELE501", label: "ELE501 - Embedded Systems" },
]

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
]

export default function LecturerClassesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSubject, setSelectedSubject] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")

    const filteredClasses = useMemo(() => {
        return classesData.filter((classItem) => {
            const matchesSearch =
                classItem.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSubject = selectedSubject === "all" || classItem.subjectCode === selectedSubject
            const matchesStatus = selectedStatus === "all" || classItem.status === selectedStatus

            return matchesSearch && matchesSubject && matchesStatus
        })
    }, [searchTerm, selectedSubject, selectedStatus])

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "active":
                return "default"
            case "pending":
                return "secondary"
            case "completed":
                return "outline"
            default:
                return "outline"
        }
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen p-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classes</h1>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by class code or subject..."
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
                        Showing {filteredClasses.length} of {classesData.length} classes
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClasses.map((classItem) => (
                            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{classItem.subjectName}</CardTitle>
                                            <CardDescription className="text-orange-500 font-medium">{classItem.classCode}</CardDescription>
                                        </div>
                                        <Badge variant={getStatusVariant(classItem.status)}>{classItem.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-500" />
                                            <span>
                                                {classItem.students}/{classItem.maxStudents}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>{classItem.semester}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div>
                                            <strong>Room:</strong> {classItem.room}
                                        </div>
                                        <div>
                                            <strong>Schedule:</strong> {classItem.schedule}
                                        </div>
                                        <div>
                                            <strong>Created:</strong> {new Date(classItem.createdDate).toLocaleDateString("vi-VN")}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}