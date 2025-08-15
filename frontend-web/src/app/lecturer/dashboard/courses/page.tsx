"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Users, ChevronRight, RefreshCw, Search } from "lucide-react"
import { getSubjects } from "@/services/courseServices"
import CourseLab from "@/components/lecturer/lab/CourseLab"

interface Subject {
    subjectId: number
    subjectName: string
    subjectCode: string
    semesterName: string // Added semesterName to the interface
}

export default function LecturerCoursesPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

    const fetchSubjects = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await getSubjects()
            if (response) {
                setSubjects(response.pageData)
                setFilteredSubjects(response.pageData)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch subjects"
            setError(errorMessage)
            console.error("Error fetching subjects:", err)
            setSubjects([])
            setFilteredSubjects([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSubjects()
    }, [fetchSubjects])

    useEffect(() => {
        const filtered = subjects.filter(
            (subject) =>
                subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                subject.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                subject.semesterName.toLowerCase().includes(searchQuery.toLowerCase()) // Added semesterName to search
        )
        setFilteredSubjects(filtered)
    }, [searchQuery, subjects])

    const handleCourseClick = (subject: Subject) => {
        setSelectedSubjectId(subject.subjectId)
        setSelectedSubject(subject)
    }

    const handleBackToCourses = () => {
        setSelectedSubjectId(null)
        setSelectedSubject(null)
    }

    if (selectedSubjectId && selectedSubject) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={handleBackToCourses}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Back
                    </Button>
                </div>
                <CourseLab subjectId={selectedSubjectId} />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="pl-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Courses</h1>
                        <p className="text-muted-foreground mt-1">Manage and view all your assigned subjects</p>
                    </div>
                </div>
            </div>

            {/* Search Input */}
            <div className="pl-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by course name, code, or semester..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border-gray-300 dark:border-gray-700 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
            </div>

            {/* Courses Grid */}
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading your courses...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                            <BookOpen className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
                    </div>
                ) : filteredSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-center mb-2">
                            {searchQuery ? "No courses match your search" : "No courses assigned yet"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredSubjects.map((subject) => (
                            <Card
                                key={subject.subjectId}
                                className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-orange-200 dark:hover:border-orange-800"
                                onClick={() => handleCourseClick(subject)}
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                                                <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors line-clamp-2">
                                                {subject.subjectName}
                                            </h3>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {subject.subjectCode}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>Click to view labs</span>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>{subject.semesterName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </div>
    )
}