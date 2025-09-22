"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClassGrades } from "@/services/gradeServices"
import { GraduationCap } from "lucide-react"

// Type definitions based on the API response
interface Grade {
    labId: number
    grade: number | null
    gradeStatus: string
    isTeamGrade: boolean
    hasIndividualGrade: boolean
}

interface Student {
    studentId: string
    studentName: string
    studentEmail: string
    teamId: string | null
    teamName: string
    grades: Grade[]
}

interface Lab {
    labId: number
    labName: string
}

interface GradeData {
    classId: number
    className: string
    labs: Lab[]
    students: Student[]
}

interface GradeTabProps {
    classId: string
}

export function GradeTab({ classId }: GradeTabProps) {
    const [gradeData, setGradeData] = useState<GradeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await getClassGrades(classId)
                setGradeData(data)
            } catch (err) {
                setError("Failed to fetch grades")
                console.error("Error fetching grades:", err)
            } finally {
                setLoading(false)
            }
        }

        if (classId) {
            fetchGrades()
        }
    }, [classId])

    // Helper function to get grade for a specific student and lab
    const getGradeForStudentLab = (student: Student, labId: number): Grade | undefined => {
        return student.grades.find((grade) => grade.labId === labId)
    }

    // Helper function to render grade cell
    const renderGradeCell = (grade: Grade | undefined) => {
        if (!grade || grade.grade === null) {
            return <span className="text-muted-foreground">-</span>
        }

        return (
            <div className="flex flex-col items-center gap-1">
                <span className="font-mono">{grade.grade}</span>
            </div>
        )
    }

    if (loading) {
        return <div className="text-center p-4">Loading grades...</div>
    }

    if (error || !gradeData) {
        return (
            <div className="text-center p-4">
                <GraduationCap className="h-8 w-8 mx-auto mb-2" />
                {error || "No grade data available"}
            </div>
        )
    }

    const { className, labs, students } = gradeData

    return (
        <div className="w-full">
            <div className="overflow-x-auto border rounded-lg">
                <Table>
                    <TableHeader className="bg-blue-100">
                        <TableRow>
                            <TableHead className="text-center sticky left-0 z-10 min-w-[60px] bg-blue-100 border-r">STT</TableHead>
                            <TableHead className="text-left sticky left-[60px] z-10 min-w-[200px] bg-blue-100 border-r">
                                Student Name
                            </TableHead>
                            {labs.map((lab) => (
                                <TableHead key={lab.labId} className="text-center min-w-[120px]">
                                    <div className="flex flex-col gap-1">
                                        {/* <span className="font-mono text-sm">Lab {lab.labId}</span> */}
                                        <span className="text-xs text-muted-foreground font-normal text-pretty">{lab.labName}</span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={student.studentId}>
                                <TableCell className="text-center sticky left-0 bg-background border-r font-medium">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="sticky left-[60px] bg-background border-r">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{student.studentName}</span>
                                        {/* {student.teamName !== "Chưa có team" && (
                                            <span className="text-xs w-fit">{student.teamName}</span>
                                        )} */}
                                    </div>
                                </TableCell>
                                {labs.map((lab) => (
                                    <TableCell key={lab.labId} className="text-center">
                                        {renderGradeCell(getGradeForStudentLab(student, lab.labId))}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}