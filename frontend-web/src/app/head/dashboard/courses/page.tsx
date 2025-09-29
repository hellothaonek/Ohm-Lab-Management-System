"use client"

import { useState, useEffect, useCallback } from "react"
import { SearchIcon, Loader2, MoreVertical } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSubjects } from "@/services/courseServices"
import CreateCourse from "@/components/head/courses/CreateCourse"
import { Input } from "@/components/ui/input"
import DeleteCourse from "@/components/head/courses/DeleteCourse"
import EditCourse from "@/components/head/courses/EditCourse"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

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
    const [searchTerm, setSearchTerm] = useState("")

    const fetchSubjects = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await getSubjects()
            console.log("Full API response:", response)
            if (response) {
                setSubjects(response.pageData)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch subjects"
            setError(errorMessage)
            console.error("Error fetching subjects:", err)
            setSubjects([])
        } finally {
            setIsLoading(false)
        }
    }, [searchTerm])

    useEffect(() => {
        fetchSubjects()
    }, [fetchSubjects])

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
            <div className="px-6">
                <div className="mb-6">
                    <div className="relative w-full sm:w-80">
                        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
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
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-blue-100">
                                    <TableRow>
                                        <TableHead>Subject Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjects.map((subject) => (
                                        <TableRow key={subject.subjectId}>
                                            <TableCell>
                                                <Link
                                                    href={`/head/dashboard/courses/[course-detail]/${subject.subjectId}`}
                                                    as={`/head/dashboard/courses/course-detail?subjectId=${subject.subjectId}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {subject.subjectName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-500">
                                                    {subject.subjectCode}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{subject.subjectDescription}</TableCell>
                                            <TableCell>{subject.subjectStatus}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}