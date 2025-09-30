"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { Pagination } from 'antd'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Subject {
    subjectId: number
    subjectName: string
    subjectCode: string
    subjectDescription: string
    subjectStatus: string
}

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
]

export default function CoursesPage() {
    const [rawSubjects, setRawSubjects] = useState<Subject[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")

    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const fetchSubjects = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await getSubjects()
            const subjectData = response.pageData

            if (subjectData) {
                setRawSubjects(subjectData)
            } else {
                setRawSubjects([])
                console.warn("API response structure is unexpected.")
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch subjects"
            setError(errorMessage)
            console.error("Error fetching subjects:", err)
            setRawSubjects([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSubjects()
    }, [fetchSubjects])

    const filteredAndPaginatedData = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim()

        const filtered = rawSubjects.filter(subject => {
            const matchesSearch =
                subject.subjectName.toLowerCase().includes(lowerCaseSearchTerm) ||
                subject.subjectCode.toLowerCase().includes(lowerCaseSearchTerm)

            const matchesStatus =
                selectedStatus === "all" || subject.subjectStatus === selectedStatus

            return matchesSearch && matchesStatus
        })

        const startIndex = (pageNum - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginated = filtered.slice(startIndex, endIndex)

        setSubjects(paginated)

        return filtered.length

    }, [rawSubjects, searchTerm, selectedStatus, pageNum, pageSize])

    const totalFilteredItems = filteredAndPaginatedData

    const handlePaginationChange = (page: number, size: number) => {
        setPageNum(page)
        if (size !== pageSize) {
            setPageSize(size)
            setPageNum(1)
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPageNum(1)
    }

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value)
        setPageNum(1)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            case "Inactive":
                return <Badge className="bg-red-500 hover:bg-red-600">Inactive</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <CardHeader>
                <CardTitle>Subjects Management</CardTitle>
            </CardHeader>
            <div className="px-6">
                <div className="mb-6 flex gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="relative w-full sm:w-80">
                            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search subjects..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-8 w-full"
                            />
                        </div>

                        <Select value={selectedStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Status" />
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
                    <CreateCourse onSubjectCreated={fetchSubjects} />
                </div>

                {isLoading && rawSubjects.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
                        <p>Loading subjects...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        <p>{error}</p>
                    </div>
                ) : subjects.length === 0 && !isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No subjects found matching your search criteria.</p>
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
                                                    href={`/head/dashboard/courses/course-detail?subjectId=${subject.subjectId}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {subject.subjectName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{subject.subjectCode}</TableCell>
                                            <TableCell>{subject.subjectDescription}</TableCell>
                                            <TableCell>
                                                {getStatusBadge(subject.subjectStatus)}
                                            </TableCell>
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

            <div className="flex justify-end p-6">
                {totalFilteredItems > 0 && (
                    <Pagination
                        current={pageNum}
                        pageSize={pageSize}
                        total={totalFilteredItems}
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                        onChange={handlePaginationChange}
                        showSizeChanger
                        onShowSizeChange={handlePaginationChange}
                    />
                )}
            </div>
        </div>
    )
}