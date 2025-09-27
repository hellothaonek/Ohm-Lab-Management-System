"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getClassGrades } from "@/services/gradeServices"
import { GraduationCap, Plus, Filter, Save, Edit, Edit2 } from "lucide-react"

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
    const [selectedStudent, setSelectedStudent] = useState<string>("all")
    const [isEditing, setIsEditing] = useState(false)
    const [editedGrades, setEditedGrades] = useState<{ [key: string]: number }>({})

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

    const getGradeForStudentLab = (student: Student, labId: number): Grade | undefined => {
        return student.grades.find((grade) => grade.labId === labId)
    }

    const renderGradeCell = (grade: Grade | undefined, student: Student, labId: number) => {
        const gradeKey = `${student.studentId}-${labId}`
        const currentGrade = editedGrades[gradeKey] !== undefined ? editedGrades[gradeKey] : grade?.grade || 0

        if (!grade || grade.grade === null) {
            if (isEditing) {
                return (
                    <Input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={editedGrades[gradeKey] || ""}
                        onChange={(e) => handleGradeChange(gradeKey, e.target.value)}
                        className="w-16 h-8 text-center"
                        placeholder="0"
                    />
                )
            }
            return <span className="text-muted-foreground">-</span>
        }

        if (isEditing) {
            return (
                <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={currentGrade}
                    onChange={(e) => handleGradeChange(gradeKey, e.target.value)}
                    className="w-16 h-8 text-center"
                />
            )
        }

        return (
            <div className="flex flex-col items-center gap-1">
                <span className="font-mono">{grade.grade}</span>
            </div>
        )
    }

    const filteredStudents =
        gradeData?.students.filter((student) => {
            if (selectedStudent === "all") return true
            return student.studentId === selectedStudent
        }) || []

    const handleGradeInput = () => {
        if (isEditing) {
            console.log("[v0] Saving all grades:", editedGrades)
            setIsEditing(false)
            setEditedGrades({})
        } else {
            setIsEditing(true)
            const initialGrades: { [key: string]: number } = {}
            gradeData?.students.forEach((student) => {
                student.grades.forEach((grade) => {
                    if (grade.grade !== null) {
                        initialGrades[`${student.studentId}-${grade.labId}`] = grade.grade
                    }
                })
            })
            setEditedGrades(initialGrades)
        }
    }

    const handleGradeChange = (gradeKey: string, value: string) => {
        const numValue = Number.parseFloat(value)
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            setEditedGrades((prev) => ({
                ...prev,
                [gradeKey]: numValue,
            }))
        } else if (value === "") {
            setEditedGrades((prev) => ({
                ...prev,
                [gradeKey]: 0,
            }))
        }
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
        <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger className="flex-1">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Students</SelectItem>
                            {gradeData?.students.map((student) => (
                                <SelectItem key={student.studentId} value={student.studentId}>
                                    {student.studentName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleGradeInput} className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            Save All
                        </>
                    ) : (
                        <>
                            <Edit2 className="h-4 w-4" />
                            Update Grade
                        </>
                    )}
                </Button>
            </div>

            <div className="w-full overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-blue-100 sticky top-0">
                        <TableRow>
                            <TableHead className="text-center sticky left-0 z-10 min-w-[60px] bg-blue-100 border-r">STT</TableHead>
                            <TableHead className="text-left sticky left-[60px] z-10 min-w-[200px] bg-blue-100 border-r">
                                Student Name
                            </TableHead>
                            {labs.map((lab) => (
                                <TableHead key={lab.labId} className="text-center min-w-[120px]">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground font-normal text-pretty">{lab.labName}</span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map((student, index) => (
                            <TableRow key={student.studentId}>
                                <TableCell className="text-center sticky left-0 bg-background border-r font-medium">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="sticky left-[60px] bg-background border-r">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{student.studentName}</span>
                                    </div>
                                </TableCell>
                                {labs.map((lab) => (
                                    <TableCell key={lab.labId} className="text-center">
                                        {renderGradeCell(getGradeForStudentLab(student, lab.labId), student, lab.labId)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {filteredStudents.length === 0 && selectedStudent !== "all" && (
                            <TableRow>
                                <TableCell colSpan={labs.length + 2} className="text-center py-8 text-muted-foreground">
                                    Không tìm thấy sinh viên được chọn
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
