"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getClassGrades, updateClassGrades } from "@/services/gradeServices"
import { GraduationCap, Filter, Edit3, Eye, Save, X } from "lucide-react"
import { toast } from "react-toastify"
import { UpdateTeamGrade } from "./UpdateTeamGrade"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UpdateIndividualGrade } from "./UpdateIndividualGrade"
import { CreateTeamGrade } from "./CreateTeamGrade"

// Type definitions
export interface Grade {
    labId: number
    grade: number | null
    gradeStatus: string
    gradeDescription: string | null
    isTeamGrade: boolean
    hasIndividualGrade: boolean
}

export interface Student {
    studentId: string
    studentName: string
    studentEmail: string
    teamId: number | null
    teamName: string
    grades: Grade[]
}

export interface Team {
    teamId: number | null
    teamName: string
    grades: Grade[]
}

export interface Lab {
    labId: number
    labName: string
}

export interface GradeData {
    classId: number
    className: string
    labs: Lab[]
    teams: Team[]
    students: Student[]
}

interface GradeTabProps {
    classId: string
}

export function GradeTab({ classId }: GradeTabProps) {
    const [gradeData, setGradeData] = useState<GradeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedLab, setSelectedLab] = useState<string>("")
    const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({})
    const [editedGrades, setEditedGrades] = useState<{ [key: string]: number }>({})
    const [editedGradeDescriptions, setEditedGradeDescriptions] = useState<{ [key: string]: string }>({})
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [isEditingIndividual, setIsEditingIndividual] = useState<{ [key: string]: boolean }>({})
    const [editedIndividualGrades, setEditedIndividualGrades] = useState<{ [key: string]: number }>({})
    const [editedIndividualComments, setEditedIndividualComments] = useState<{ [key: string]: string }>({})

    // Initialize edit states for individual grades and comments
    const initializeIndividualEditStates = (student: Student, labId: number) => {
        const grade = student.grades.find((g) => g.labId === labId)
        const gradeKey = `${student.studentId}-${labId}-individual`
        const commentKey = `${student.studentId}-${labId}-individual-comment`

        setEditedIndividualGrades(prev => ({ ...prev, [gradeKey]: grade?.grade ?? 0 }))
        setEditedIndividualComments(prev => ({ ...prev, [commentKey]: grade?.gradeDescription ?? "" }))
    }

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await getClassGrades(classId)

                const teams = data.students.reduce((acc: Team[], student: Student) => {
                    if (student.teamId) {
                        let existingTeam = acc.find((team) => team.teamId === student.teamId)
                        if (!existingTeam) {
                            existingTeam = {
                                teamId: student.teamId,
                                teamName: student.teamName,
                                grades: [],
                            }
                            acc.push(existingTeam)
                        }
                        existingTeam.grades = student.grades.filter(g => g.isTeamGrade)
                    }
                    return acc
                }, [])

                const labs = data.labs || []
                setGradeData({ ...data, teams, labs })

                if (labs.length > 0) {
                    setSelectedLab(labs[0].labId.toString())
                }
            } catch (err) {
                setError("Failed to fetch grades")
                console.error("Error fetching grades:", err)
                toast.error("Failed to fetch grades")
            } finally {
                setLoading(false)
            }
        }

        if (classId) {
            fetchGrades()
        }
    }, [classId])

    const getGradeForTeamLab = (team: Team, labId: number): Grade | undefined => {
        return team.grades.find((grade) => grade.labId === labId)
    }

    const handleIndividualGradeChange = (gradeKey: string, value: string) => {
        const numValue = Number.parseFloat(value)
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            setEditedIndividualGrades((prev) => ({
                ...prev,
                [gradeKey]: numValue,
            }))
        } else if (value === "") {
            setEditedIndividualGrades((prev) => ({
                ...prev,
                [gradeKey]: 0,
            }))
        }
    }

    const handleIndividualCommentChange = (commentKey: string, value: string) => {
        setEditedIndividualComments((prev) => ({
            ...prev,
            [commentKey]: value,
        }))
    }

    const handleEditToggle = (team: Team, labId: number) => {
        const gradeKey = `${team.teamId}-${labId}`
        const isCurrentlyEditing = isEditing[gradeKey]

        if (!isCurrentlyEditing) {
            const grade = getGradeForTeamLab(team, labId)
            setEditedGrades(prev => ({ ...prev, [gradeKey]: grade?.grade ?? 0 }))
            setEditedGradeDescriptions(prev => ({ ...prev, [`${gradeKey}-gradeDescription`]: grade?.gradeDescription ?? "" }))
        }

        setIsEditing((prev) => ({
            ...prev,
            [gradeKey]: !isCurrentlyEditing,
        }))
    }

    const handleCancelEdit = (gradeKey: string) => {
        setIsEditing((prev) => ({ ...prev, [gradeKey]: false }))
        setEditedGrades((prev) => {
            const newGrades = { ...prev }
            delete newGrades[gradeKey]
            return newGrades
        })
        setEditedGradeDescriptions((prev) => {
            const newDescriptions = { ...prev }
            delete newDescriptions[`${gradeKey}-gradeDescription`]
            return newDescriptions
        })
    }

    const handleIndividualEditToggle = (student: Student, labId: number) => {
        const gradeKey = `${student.studentId}-${labId}-individual`
        const isCurrentlyEditing = isEditingIndividual[gradeKey]

        if (!isCurrentlyEditing) {
            initializeIndividualEditStates(student, labId)
        }

        setIsEditingIndividual((prev) => ({
            ...prev,
            [gradeKey]: !isCurrentlyEditing,
        }))
    }

    const handleCancelIndividualEdit = (gradeKey: string, commentKey: string) => {
        setIsEditingIndividual((prev) => ({ ...prev, [gradeKey]: false }))
        setEditedIndividualGrades((prev) => {
            const newGrades = { ...prev }
            delete newGrades[gradeKey]
            return newGrades
        })
        setEditedIndividualComments((prev) => {
            const newComments = { ...prev }
            delete newComments[commentKey]
            return newComments
        })
    }

    const handleSaveIndividualGrade = async (student: Student, labId: number) => {
        const gradeKey = `${student.studentId}-${labId}-individual`
        const commentKey = `${student.studentId}-${labId}-individual-comment`
        try {
            const gradeToSave = editedIndividualGrades[gradeKey] !== undefined ? editedIndividualGrades[gradeKey] : 0
            const commentToSave = editedIndividualComments[commentKey] ?? ""

            await updateClassGrades(Number(classId), {
                grades: [{
                    studentId: student.studentId,
                    labId: labId.toString(),
                    grade: gradeToSave,
                    gradeDescription: commentToSave,
                    gradeStatus: "graded"
                }]
            })

            setGradeData((prev: GradeData | null) => {
                if (!prev) return prev
                return {
                    ...prev,
                    students: prev.students.map((s) => {
                        if (s.studentId === student.studentId) {
                            return {
                                ...s,
                                grades: s.grades.map((g) =>
                                    g.labId === labId
                                        ? { ...g, grade: gradeToSave, gradeDescription: commentToSave, gradeStatus: "graded", hasIndividualGrade: true }
                                        : g
                                ),
                            }
                        }
                        return s
                    }),
                }
            })

            setIsEditingIndividual((prev) => ({ ...prev, [gradeKey]: false }))
            handleCancelIndividualEdit(gradeKey, commentKey)
        } catch (err) {
            console.error("Error saving individual grade:", err)
            toast.error("Failed to save individual grade")
        }
    }

    const handleViewIndividualGrades = (team: Team) => {
        setSelectedTeam(team)
        setIsModalOpen(true)
    }

    const handleGradeCreated = (newGrade: { labId: number; teamId: number; grade: number; gradeDescription: string; gradeStatus: string }) => {
        setGradeData((prev: GradeData | null) => {
            if (!prev) return prev
            return {
                ...prev,
                teams: prev.teams.map((team) => {
                    if (team.teamId === newGrade.teamId) {
                        return {
                            ...team,
                            grades: [
                                ...team.grades.filter((g) => g.labId !== newGrade.labId),
                                {
                                    labId: newGrade.labId,
                                    grade: newGrade.grade,
                                    gradeDescription: newGrade.gradeDescription,
                                    gradeStatus: newGrade.gradeStatus,
                                    isTeamGrade: true,
                                    hasIndividualGrade: false,
                                },
                            ],
                        }
                    }
                    return team
                }),
            }
        })
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

    const { labs, teams, students } = gradeData

    const filteredTeams = teams.filter((team) => {
        return team.teamId !== null
    })

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2 max-w-sm">
                    <Select value={selectedLab} onValueChange={setSelectedLab}>
                        <SelectTrigger className="flex-1 w-80">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select Lab" />
                        </SelectTrigger>
                        <SelectContent>
                            {labs.map((lab: Lab) => (
                                <SelectItem key={lab.labId} value={lab.labId.toString()}>
                                    {lab.labName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="ml-auto">
                    <CreateTeamGrade
                        classId={classId}
                        teams={teams}
                        labs={labs}
                        onGradeCreated={handleGradeCreated}
                    />
                </div>

            </div>

            <div className="w-full overflow-x-auto border rounded-lg">
                <Table className="min-w-full">
                    <TableHeader className="bg-blue-50 dark:bg-gray-800 sticky top-0">
                        <TableRow>
                            <TableHead className="text-center sticky left-0 z-10 min-w-[60px] bg-blue-50 dark:bg-gray-800 border-r">STT</TableHead>
                            <TableHead className="text-left sticky left-[60px] z-10 min-w-[200px] bg-blue-50 dark:bg-gray-800 border-r">
                                Team Name
                            </TableHead>
                            <TableHead className="text-center min-w-[120px]">Status</TableHead>
                            <TableHead className="text-center min-w-[100px]">Grade</TableHead>
                            <TableHead className="text-left min-w-[250px]">Comment</TableHead>
                            <TableHead className="text-center min-w-[150px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTeams.map((team: Team, index: number) => {
                            const labId = Number(selectedLab)
                            const grade = getGradeForTeamLab(team, labId)
                            const gradeKey = `${team.teamId}-${labId}`
                            const isRowEditing = isEditing[gradeKey]

                            const displayGrade = editedGrades[gradeKey] !== undefined ? editedGrades[gradeKey] : grade?.grade
                            const displayGradeDescription = editedGradeDescriptions[`${gradeKey}-gradeDescription`] ?? grade?.gradeDescription

                            return (
                                <TableRow key={team.teamId}>
                                    <TableCell className="text-center sticky left-0 bg-background border-r font-medium z-10">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="sticky left-[60px] bg-background border-r z-10">
                                        <span className="font-medium">{team.teamName || "No Team"}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {grade?.grade !== null && grade?.grade !== undefined ? (
                                            <span className="text-green-600 font-medium flex items-center justify-center">
                                                Graded
                                            </span>
                                        ) : (
                                            <span className="text-yellow-600 font-medium flex items-center justify-center">
                                                Pending
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {isRowEditing ? (
                                            <UpdateTeamGrade
                                                labId={labId}
                                                teamId={team.teamId!}
                                                initialGrade={displayGrade ?? 0}
                                                initialDescription={displayGradeDescription ?? ""}
                                                onSave={() => {
                                                    setGradeData((prev: GradeData | null) => {
                                                        if (!prev) return prev
                                                        return {
                                                            ...prev,
                                                            teams: prev.teams.map((t) => {
                                                                if (t.teamId === team.teamId) {
                                                                    return {
                                                                        ...t,
                                                                        grades: t.grades.map((g) =>
                                                                            g.labId === labId
                                                                                ? { ...g, grade: editedGrades[gradeKey] ?? g.grade, gradeDescription: editedGradeDescriptions[`${gradeKey}-gradeDescription`] ?? g.gradeDescription, gradeStatus: "graded" }
                                                                                : g
                                                                        ),
                                                                    }
                                                                }
                                                                return t
                                                            }),
                                                        }
                                                    })
                                                    setIsEditing((prev) => ({ ...prev, [gradeKey]: false }))
                                                    handleCancelEdit(gradeKey)
                                                }}
                                                onCancel={() => handleCancelEdit(gradeKey)}
                                            />
                                        ) : (
                                            <span className="font-bold">
                                                {displayGrade !== undefined && displayGrade !== null ? displayGrade.toFixed(1) : "-"}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isRowEditing ? null : (
                                            <span>{displayGradeDescription || "-"}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {!isRowEditing && (
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    onClick={() => handleEditToggle(team, labId)}
                                                    size="sm"
                                                    variant="secondary"
                                                >
                                                    <Edit3 className="h-4 w-4 mr-1" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleViewIndividualGrades(team)}
                                                    size="sm"
                                                    variant="secondary"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {filteredTeams.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No teams found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <UpdateIndividualGrade
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                selectedTeam={selectedTeam}
                selectedLab={selectedLab}
                editedIndividualGrades={editedIndividualGrades}
                editedIndividualComments={editedIndividualComments}
                isEditingIndividual={isEditingIndividual}
                handleIndividualGradeChange={handleIndividualGradeChange}
                handleIndividualCommentChange={handleIndividualCommentChange}
                handleIndividualEditToggle={handleIndividualEditToggle}
                handleCancelIndividualEdit={handleCancelIndividualEdit}
                handleSaveIndividualGrade={handleSaveIndividualGrade}
            />
        </div>
    )
}