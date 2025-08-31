"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Edit3, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Student {
    classUserId: number
    userName: string
    userEmail: string
    userNumberCode: string
}

interface Grade {
    studentId: number
    midtermGrade?: number
    finalGrade?: number
    totalGrade?: number
    status: "Pass" | "Fail" | "Not Graded"
}

interface GradeTabProps {
    classId: string
    students: Student[]
}

export default function GradeTab({ classId, students }: GradeTabProps) {
    const [grades, setGrades] = useState<Grade[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingStudent, setEditingStudent] = useState<number | null>(null)
    const [tempGrades, setTempGrades] = useState<{ midterm: string; final: string }>({ midterm: "", final: "" })
    const { toast } = useToast()

    useEffect(() => {
        // Initialize grades for all students
        const initialGrades = students.map((student) => ({
            studentId: student.classUserId,
            midtermGrade: undefined,
            finalGrade: undefined,
            totalGrade: undefined,
            status: "Not Graded" as const,
        }))
        setGrades(initialGrades)
        setLoading(false)
    }, [students])

    const calculateTotalGrade = (midterm?: number, final?: number): number | undefined => {
        if (midterm !== undefined && final !== undefined) {
            return Math.round((midterm * 0.4 + final * 0.6) * 100) / 100
        }
        return undefined
    }

    const getGradeStatus = (total?: number): "Pass" | "Fail" | "Not Graded" => {
        if (total === undefined) return "Not Graded"
        return total >= 5.0 ? "Pass" : "Fail"
    }

    const handleEditGrade = (studentId: number) => {
        const grade = grades.find((g) => g.studentId === studentId)
        setEditingStudent(studentId)
        setTempGrades({
            midterm: grade?.midtermGrade?.toString() || "",
            final: grade?.finalGrade?.toString() || "",
        })
    }

    const handleSaveGrade = async (studentId: number) => {
        const midterm = tempGrades.midterm ? Number.parseFloat(tempGrades.midterm) : undefined
        const final = tempGrades.final ? Number.parseFloat(tempGrades.final) : undefined

        // Validate grades
        if (
            (midterm !== undefined && (midterm < 0 || midterm > 10)) ||
            (final !== undefined && (final < 0 || final > 10))
        ) {
            toast({
                title: "Invalid Grade",
                description: "Grades must be between 0 and 10",
                variant: "destructive",
            })
            return
        }

        setSaving(true)
        try {
            const total = calculateTotalGrade(midterm, final)
            const status = getGradeStatus(total)

            setGrades((prev) =>
                prev.map((grade) =>
                    grade.studentId === studentId
                        ? { ...grade, midtermGrade: midterm, finalGrade: final, totalGrade: total, status }
                        : grade,
                ),
            )

            setEditingStudent(null)
            setTempGrades({ midterm: "", final: "" })

            toast({
                title: "Grade Saved",
                description: "Student grade has been updated successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save grade",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingStudent(null)
        setTempGrades({ midterm: "", final: "" })
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Pass":
                return "default"
            case "Fail":
                return "destructive"
            default:
                return "secondary"
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
                    <p>Loading grades...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Student Grades</CardTitle>
                    <p className="text-muted-foreground">
                        Manage and track student grades for this class. Total grade = Midterm (40%) + Final (60%)
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">STT</TableHead>
                                    <TableHead className="font-semibold">Student Code</TableHead>
                                    <TableHead className="font-semibold">Name</TableHead>
                                    <TableHead className="font-semibold text-center">Midterm (40%)</TableHead>
                                    <TableHead className="font-semibold text-center">Final (60%)</TableHead>
                                    <TableHead className="font-semibold text-center">Total</TableHead>
                                    <TableHead className="font-semibold text-center">Status</TableHead>
                                    <TableHead className="font-semibold text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student, index) => {
                                    const grade = grades.find((g) => g.studentId === student.classUserId)
                                    const isEditing = editingStudent === student.classUserId

                                    return (
                                        <TableRow key={student.classUserId}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell>{student.userNumberCode}</TableCell>
                                            <TableCell>{student.userName}</TableCell>
                                            <TableCell className="text-center">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={tempGrades.midterm}
                                                        onChange={(e) => setTempGrades((prev) => ({ ...prev, midterm: e.target.value }))}
                                                        className="w-20 text-center"
                                                        placeholder="0-10"
                                                    />
                                                ) : (
                                                    <span className="font-medium">
                                                        {grade?.midtermGrade !== undefined ? grade.midtermGrade : "-"}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={tempGrades.final}
                                                        onChange={(e) => setTempGrades((prev) => ({ ...prev, final: e.target.value }))}
                                                        className="w-20 text-center"
                                                        placeholder="0-10"
                                                    />
                                                ) : (
                                                    <span className="font-medium">
                                                        {grade?.finalGrade !== undefined ? grade.finalGrade : "-"}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-bold text-lg">
                                                    {grade?.totalGrade !== undefined ? grade.totalGrade : "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusBadgeVariant(grade?.status || "Not Graded")}>
                                                    {grade?.status || "Not Graded"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isEditing ? (
                                                    <div className="flex justify-center gap-2">
                                                        <Button size="sm" onClick={() => handleSaveGrade(student.classUserId)} disabled={saving}>
                                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={saving}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="outline" onClick={() => handleEditGrade(student.classUserId)}>
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
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
