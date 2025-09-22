"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Users, Calendar, BookOpen, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/services/userServices"
import { getClassByStudentId } from "@/services/classServices"
import Link from "next/link"

interface ClassUser {
    classUserId: number
    classId: number
    userId: string
    className: string
    userName: string
    userEmail: string
    userRole: string
    userNumberCode: string
    subjectId: number
    subjectName: string
    subjectCode: string
    subjectDescription: string
    subjectStatus: string
    semesterName: string
    semesterStartDate: string
    semesterEndDate: string
    classUserStatus: string
}

interface Class {
    classId: number
    subjectId: number
    lecturerId: string
    scheduleTypeId: number
    className: string
    classDescription: string
    classStatus: string
    subjectName: string
    lecturerName: string
    semesterName: string
    semesterStartDate: string
    semesterEndDate: string
    scheduleTypeName: string
    scheduleTypeDow: string
    slotName: string
    slotStartTime: string
    slotEndTime: string
    classUsers: ClassUser[]
}

export default function StudentClassesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSubject, setSelectedSubject] = useState("all")
    const [selectedSemester, setSelectedSemester] = useState("all")
    const [classes, setClasses] = useState<Class[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const subjects = useMemo(() => {
        const uniqueSubjects = Array.from(new Set(classes.map((classItem) => classItem.subjectName)))
        return [
            { value: "all", label: "All Subjects" },
            ...uniqueSubjects.map((subject) => ({
                value: subject,
                label: subject,
            })),
        ]
    }, [classes])

    const semesterOptions = useMemo(() => {
        const uniqueSemesters = Array.from(new Set(classes.map((classItem) => classItem.semesterName)))
        return [
            { value: "all", label: "All Semesters" },
            ...uniqueSemesters.map((semester) => ({
                value: semester,
                label: semester,
            })),
        ]
    }, [classes])

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true)
                const user = await getCurrentUser()
                const studentId = user.userId
                const classesData = await getClassByStudentId(studentId)
                console.log("Check student class:", classesData)
                const activeClasses = classesData.filter((classItem: Class) => classItem.classStatus === "Active")
                setClasses(activeClasses)
            } catch (err) {
                setError("Failed to fetch classes. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchClasses()
    }, [])

    const filteredClasses = useMemo(() => {
        return classes.filter((classItem) => {
            const matchesSearch =
                classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSubject = selectedSubject === "all" || classItem.subjectName === selectedSubject
            const matchesSemester = selectedSemester === "all" || classItem.semesterName === selectedSemester
            return matchesSearch && matchesSubject && matchesSemester
        })
    }, [searchTerm, selectedSubject, selectedSemester, classes])

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Active":
                return "default"
            default:
                return "outline"
        }
    }

    return (
        <div className="min-h-screen p-4">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classes</h1>
                    </div>
                </div>
            </div>

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
                        <SelectTrigger className="w-40">
                            <Filter className="h-4 w-4" />
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

                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-40">
                            <Filter className="h-4 w-4" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {semesterOptions.map((semester) => (
                                <SelectItem key={semester.value} value={semester.value}>
                                    {semester.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredClasses.length} of {classes.length} classes
                </p>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">Loading classes...</p>
                    </CardContent>
                </Card>
            ) : error ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-red-500">{error}</p>
                    </CardContent>
                </Card>
            ) : filteredClasses.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search criteria or enroll in a new class.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((classItem) => (
                        <Card
                            key={classItem.classId}
                            className="shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <Link href={`/student/dashboard/my-classes/class-detail?classId=${classItem.classId}`} passHref>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{classItem.subjectName}</CardTitle>
                                            <CardDescription className="text-orange-500 font-medium">{classItem.className}</CardDescription>
                                        </div>
                                        <Badge variant={getStatusVariant(classItem.classStatus)}>{classItem.classStatus}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-500" />
                                            <span>{classItem.classUsers.length} students</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>{classItem.semesterName}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div>
                                            <strong>Schedule:</strong> {classItem.scheduleTypeDow}
                                        </div>
                                        <div>
                                            <strong>Time:</strong> {classItem.slotStartTime} - {classItem.slotEndTime}
                                        </div>
                                        <div>
                                            <strong>Lecturer:</strong> {classItem.lecturerName}
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}