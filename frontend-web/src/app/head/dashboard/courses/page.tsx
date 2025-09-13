"use client"

import { useState, useEffect, useCallback } from "react"
import { SearchIcon, Loader2, MoreVertical } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSubjects } from "@/services/courseServices"
import CreateCourse from "@/components/head/courses/CreateCourse"
import { Input } from "@/components/ui/input"
import DeleteCourse from "@/components/head/courses/DeleteCourse"
import EditCourse from "@/components/head/courses/EditCourse"
import { Pagination } from "antd"
import Link from "next/link"

interface Subject {
    subjectId: number
    subjectName: string
    subjectCode: string
    subjectDescription: string
    subjectStatus: string
}

export default function CoursesPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchSubjects = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await getSubjects()
            console.log("Full API response:", response)
            if (response) {
                setSubjects(response.pageData || [])
                setTotalItems(response.pageInfo?.totalItem || 0)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch subjects"
            setError(errorMessage)
            console.error("Error fetching subjects:", err)
            setSubjects([])
        } finally {
            setIsLoading(false)
        }
    }, [pageNum, pageSize, searchTerm])

    useEffect(() => {
        fetchSubjects()
    }, [fetchSubjects])

    const handlePaginationChange = (page: number, pageSize: number | undefined) => {
        setPageNum(page)
        setPageSize(pageSize || 10)
    }

    return (
        <div className="space-y-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Subjects Management</CardTitle>
                        <CardDescription>View and manage all available subjects</CardDescription>
                    </div>
                    <CreateCourse onSubjectCreated={fetchSubjects} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="relative w-full sm:w-80">
                        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPageNum(1)
                            }}
                            className="pl-8 w-full sm:w-80"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
                        <p>Loading subjects...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        <p>{error}</p>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No subjects found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {subjects.map((subject) => (
                                <Link
                                    key={subject.subjectId}
                                    href={`/head/dashboard/courses/[course-detail]/${subject.subjectId}`}
                                    as={`/head/dashboard/courses/course-detail?subjectId=${subject.subjectId}`}
                                    passHref
                                    className="block"
                                >
                                    <Card className="shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                                        <CardHeader className="pb-3">
                                            <img
                                                src="https://i.pinimg.com/1200x/9f/ef/18/9fef186063141e36368d32ead5d81269.jpg"
                                                alt={subject.subjectName}
                                                className="w-full h-full object-cover rounded-t-lg"
                                            />
                                            <div className="flex items-start justify-between mt-3">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-semibold">
                                                        {subject.subjectName}
                                                    </CardTitle>
                                                    <Badge variant="secondary" className="mt-2 bg-green-500">
                                                        {subject.subjectCode}
                                                    </Badge>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="flex flex-row items-center justify-center gap-2 p-2">
                                                        <DropdownMenuItem asChild>
                                                            <EditCourse
                                                                subjectId={subject.subjectId}
                                                                subjectName={subject.subjectName}
                                                                subjectDescription={subject.subjectDescription}
                                                                subjectStatus={subject.subjectStatus}
                                                                onSubjectUpdated={fetchSubjects}
                                                            />
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <DeleteCourse
                                                                subjectId={subject.subjectId}
                                                                subjectName={subject.subjectName}
                                                                onSubjectDeleted={fetchSubjects}
                                                            />
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <CardDescription className="mb-4 min-h-[3rem]">
                                                {subject.subjectDescription}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        <div className="flex justify-center mt-4">
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