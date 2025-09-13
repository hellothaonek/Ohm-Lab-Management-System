"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface StudentLabGrade {
    labId: number
    labName: string
    grade?: number
    comment?: string
    gradeDate?: Date
    status: "Not Submitted" | "Submitted" | "Graded"
}

interface StudentGradeTabProps {
    studentId: string
    classId: string
}

export default function StudentGradeTab({ studentId, classId }: StudentGradeTabProps) {
    const [labGrades, setLabGrades] = useState<StudentLabGrade[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const mockGrades: StudentLabGrade[] = [
            {
                labId: 1,
                labName: "Lab 1: Introduction to React",
                grade: 8.5,
                comment: "Good work on component structure. Consider improving state management.",
                gradeDate: new Date("2024-01-15"),
                status: "Graded",
            },
            {
                labId: 2,
                labName: "Lab 2: State Management with Hooks",
                grade: 9.0,
                comment: "Excellent understanding of useState and useEffect hooks.",
                gradeDate: new Date("2024-01-22"),
                status: "Graded",
            },
            {
                labId: 3,
                labName: "Lab 3: API Integration",
                grade: 7.5,
                comment: "API calls implemented correctly, but error handling needs improvement.",
                gradeDate: new Date("2024-01-29"),
                status: "Graded",
            },
            {
                labId: 4,
                labName: "Lab 4: Advanced Components",
                status: "Submitted",
            },
            {
                labId: 5,
                labName: "Lab 5: Testing and Deployment",
                status: "Not Submitted",
            },
        ]

        setLabGrades(mockGrades)
        setLoading(false)
    }, [studentId, classId])

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Graded":
                return "default"
            case "Submitted":
                return "secondary"
            default:
                return "outline"
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p>Loading your lab grades...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">My Lab Grades</CardTitle>
                <p className="text-muted-foreground">View your lab assignment grades, comments, and submission status.</p>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Lab Name</TableHead>
                                <TableHead className="font-semibold text-center">Grade</TableHead>
                                <TableHead className="font-semibold">Comment</TableHead>
                                <TableHead className="font-semibold text-center">Grade Date</TableHead>
                                <TableHead className="font-semibold text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {labGrades.map((lab) => (
                                <TableRow key={lab.labId}>
                                    <TableCell className="font-medium">{lab.labName}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-semibold text-lg">
                                            {lab.grade !== undefined ? lab.grade.toFixed(1) : "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <span className="text-sm text-muted-foreground">{lab.comment || "-"}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm">{lab.gradeDate ? formatDate(lab.gradeDate) : "-"}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusBadgeVariant(lab.status)}>{lab.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
