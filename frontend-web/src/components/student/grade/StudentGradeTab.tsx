"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, User } from "lucide-react"

// Type definitions based on the API response
interface Grade {
    labId: number
    grade: number | null
    gradeStatus: string
    isTeamGrade: boolean
    hasIndividualGrade: boolean
}

interface Lab {
    labId: number
    labName: string
}

interface StudentGradeData {
    classId: number
    className: string
    studentId: string
    studentName: string
    studentEmail: string
    teamId: string | null
    teamName: string
    labs: Lab[]
    grades: Grade[]
}

interface StudentGradeTabProps {
    classId: string
    studentId: string
}

export function StudentGradeTab({ classId, studentId }: StudentGradeTabProps) {
    // Hardcoded data
    const gradeData: StudentGradeData = {
        classId: parseInt(classId) || 1,
        className: "Introduction to Programming",
        studentId: studentId || "STU001",
        studentName: "Nguyen Van A",
        studentEmail: "nguyenvana@example.com",
        teamId: "TEAM001",
        teamName: "Group Alpha",
        labs: [
            { labId: 1, labName: "Lab 1: Variables and Data Types" },
            { labId: 2, labName: "Lab 2: Control Structures" },
            { labId: 3, labName: "Lab 3: Functions" },
        ],
        grades: [
            { labId: 1, grade: 8.5, gradeStatus: "Graded", isTeamGrade: false, hasIndividualGrade: true },
            { labId: 2, grade: 7.0, gradeStatus: "Graded", isTeamGrade: true, hasIndividualGrade: false },
            { labId: 3, grade: null, gradeStatus: "Pending", isTeamGrade: false, hasIndividualGrade: false },
        ],
    }

    const getGradeForLab = (labId: number): Grade | undefined => {
        return gradeData.grades.find((grade) => grade.labId === labId)
    }

    const renderGradeCell = (grade: Grade | undefined) => {
        if (!grade || grade.grade === null) {
            return (
                <div className="flex flex-col items-center gap-1">
                    <span className="text-muted-foreground">-</span>
                </div>
            )
        }

        const getGradeColor = (score: number) => {
            return score < 5.0 ? "text-red-600" : "text-black"
        }

        return (
            <div className="flex flex-col items-center gap-1">
                <span className={`font-mono text-lg font-semibold ${getGradeColor(grade.grade)}`}>{grade.grade}</span>
            </div>
        )
    }

    if (!gradeData) {
        return (
            <div className="text-center p-4">
                <GraduationCap className="h-8 w-8 mx-auto mb-2" />
                No grade data available
            </div>
        )
    }

    const { className, studentName, studentEmail, teamName, labs } = gradeData

    return (
        <div className="w-full space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center min-w-[60px]">STT</TableHead>
                                    <TableHead className="text-left min-w-[200px]">Tên bài lab</TableHead>
                                    <TableHead className="text-center min-w-[120px]">Điểm</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labs.map((lab, index) => {
                                    const grade = getGradeForLab(lab.labId)
                                    return (
                                        <TableRow key={lab.labId}>
                                            <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{lab.labName}</TableCell>
                                            <TableCell className="text-center">{renderGradeCell(grade)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}