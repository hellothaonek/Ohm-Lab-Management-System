"use client"

import { useState } from "react"

import { Edit, Trash2, Search } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import DashboardLayout from "@/src/components/dashboard-layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortStatus, setSortStatus] = useState("all")

    const courses = [
        {
            id: 1,
            name: "Electronics 101",
            code: "ELE101",
            status: "active",
            createDate: "2025-06-01",
        },
        {
            id: 2,
            name: "Digital Systems",
            code: "DIG201",
            status: "active",
            createDate: "2025-06-02",
        },
        {
            id: 3,
            name: "Microcontrollers",
            code: "MIC301",
            status: "draft",
            createDate: "2025-06-03",
        },
        {
            id: 4,
            name: "Signal Processing",
            code: "SIG401",
            status: "completed",
            createDate: "2025-06-04",
        },
    ]

    const filteredAndSortedCourses = courses
        .filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortStatus === "all") return 0
            return a.status === sortStatus ? -1 : b.status === sortStatus ? 1 : 0
        })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            case "draft":
                return <Badge className="bg-gray-500 hover:bg-gray-600">Draft</Badge>
            case "completed":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <DashboardLayout role="head">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        New Course
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Courses Management</CardTitle>
                        <CardDescription>View and manage all available courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative mb-4 flex gap-2">
                            <div className="relative w-full md:w-[300px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name or code..."
                                    className="pl-8 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={sortStatus} onValueChange={setSortStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Sort by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="rounded-md border">
                            <div className="grid grid-cols-[1fr_150px_150px_150px_100px] gap-2 p-4 font-medium border-b">
                                <div>Course Name</div>
                                <div>Course Code</div>
                                <div>Create Date</div>
                                <div>Status</div>
                                <div>Actions</div>
                            </div>
                            {filteredAndSortedCourses.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    No courses found matching your search or sort criteria.
                                </div>
                            ) : (
                                filteredAndSortedCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="grid grid-cols-[1fr_150px_150px_150px_100px] gap-2 p-4 border-b last:border-0 items-center"
                                    >
                                        <div>{course.name}</div>
                                        <div>{course.code}</div>
                                        <div>{new Date(course.createDate).toLocaleDateString()}</div>
                                        <div>{getStatusBadge(course.status)}</div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}