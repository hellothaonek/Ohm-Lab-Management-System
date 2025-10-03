"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, X, Edit3 } from "lucide-react"
import { Student, Team } from "./GradeTab"
import { getTeamGrade } from "@/services/gradeServices"
import { toast } from "react-toastify"

// Interface for the API response
interface TeamGradeMember {
    studentId: string
    studentName: string
    individualGrade: number | null
    teamGrade: number | null
    isAdjusted: boolean
    individualComment: string | null
}

interface TeamGradeResponse {
    teamId: number
    teamName: string
    labId: number
    labName: string
    teamGrade: number | null
    teamComment: string | null
    members: TeamGradeMember[]
    gradedDate: string
    gradeStatus: string
}

interface UpdateIndividualGradeProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedTeam: Team | null
    selectedLab: string
    editedIndividualGrades: { [key: string]: number }
    editedIndividualComments: { [key: string]: string }
    isEditingIndividual: { [key: string]: boolean }
    handleIndividualGradeChange: (gradeKey: string, value: string) => void
    handleIndividualCommentChange: (commentKey: string, value: string) => void
    handleIndividualEditToggle: (student: Student, labId: number) => void
    handleCancelIndividualEdit: (gradeKey: string, commentKey: string) => void
    handleSaveIndividualGrade: (student: Student, labId: number) => void
}

export function UpdateIndividualGrade({
    isOpen,
    onOpenChange,
    selectedTeam,
    selectedLab,
    editedIndividualGrades,
    editedIndividualComments,
    isEditingIndividual,
    handleIndividualGradeChange,
    handleIndividualCommentChange,
    handleIndividualEditToggle,
    handleCancelIndividualEdit,
    handleSaveIndividualGrade
}: UpdateIndividualGradeProps) {
    const [teamGradeData, setTeamGradeData] = useState<TeamGradeResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTeamGrades = async () => {
            if (!isOpen || !selectedTeam?.teamId || !selectedLab) {
                return
            }

            try {
                setLoading(true)
                setError(null)
                const response = await getTeamGrade(selectedLab, selectedTeam.teamId.toString())
                setTeamGradeData(response)
            } catch (err) {
                setError("Failed to fetch team grades")
                console.error("Error fetching team grades:", err)
                toast.error("Failed to fetch team grades")
            } finally {
                setLoading(false)
            }
        }

        fetchTeamGrades()
    }, [isOpen, selectedTeam, selectedLab])

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Individual Grades for {selectedTeam?.teamName}</DialogTitle>
                    </DialogHeader>
                    <div className="text-center p-4">Loading team grades...</div>
                </DialogContent>
            </Dialog>
        )
    }

    if (error || !teamGradeData) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Individual Grades for {selectedTeam?.teamName}</DialogTitle>
                    </DialogHeader>
                    <div className="text-center p-4">{error || "No team grade data available"}</div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Individual Grades for {selectedTeam?.teamName}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Student Name</TableHead>
                                <TableHead className="text-center">Team Grade</TableHead>
                                <TableHead className="text-center">Individual Grade</TableHead>
                                <TableHead className="text-center">Individual Comment</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamGradeData.members.map((member) => {
                                const labId = Number(selectedLab)
                                const individualGradeKey = `${member.studentId}-${labId}-individual`
                                const individualCommentKey = `${member.studentId}-${labId}-individual-comment`
                                const isRowEditing = isEditingIndividual[individualGradeKey]
                                const displayIndividualGrade = editedIndividualGrades[individualGradeKey] !== undefined
                                    ? editedIndividualGrades[individualGradeKey]
                                    : member.individualGrade !== null && member.individualGrade !== undefined
                                        ? member.individualGrade
                                        : null
                                const displayIndividualComment = editedIndividualComments[individualCommentKey] !== undefined
                                    ? editedIndividualComments[individualCommentKey]
                                    : member.individualComment ?? "-"

                                // Create a Student object for compatibility with existing handlers
                                const student: Student = {
                                    studentId: member.studentId,
                                    studentName: member.studentName,
                                    studentEmail: "", // Email not provided in API response
                                    teamId: teamGradeData.teamId,
                                    teamName: teamGradeData.teamName,
                                    grades: [{
                                        labId: teamGradeData.labId,
                                        grade: member.individualGrade,
                                        gradeStatus: teamGradeData.gradeStatus,
                                        gradeDescription: member.individualComment,
                                        isTeamGrade: false,
                                        hasIndividualGrade: member.isAdjusted
                                    }]
                                }

                                return (
                                    <TableRow key={member.studentId}>
                                        <TableCell className="text-center">{member.studentName}</TableCell>
                                        <TableCell className="text-center">
                                            {teamGradeData.teamGrade !== null && teamGradeData.teamGrade !== undefined
                                                ? teamGradeData.teamGrade.toFixed(1)
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isRowEditing ? (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={
                                                        displayIndividualGrade !== null && displayIndividualGrade !== 0
                                                            ? displayIndividualGrade.toString()
                                                            : ""
                                                    }
                                                    onChange={(e) => handleIndividualGradeChange(individualGradeKey, e.target.value)}
                                                    className="w-20 h-9 text-center mx-auto"
                                                    placeholder="0.0"
                                                />
                                            ) : (
                                                <span>
                                                    {displayIndividualGrade !== null
                                                        ? displayIndividualGrade.toFixed(1)
                                                        : "-"}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isRowEditing ? (
                                                <Textarea
                                                    value={displayIndividualComment}
                                                    onChange={(e) => handleIndividualCommentChange(individualCommentKey, e.target.value)}
                                                    className="w-full h-16 text-sm"
                                                    placeholder="Enter comment..."
                                                />
                                            ) : (
                                                <span>{displayIndividualComment}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {member.individualGrade !== null && member.individualGrade !== undefined
                                                ? <span className="text-green-600">Graded</span>
                                                : <span className="text-yellow-600">Pending</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isRowEditing ? (
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        onClick={() => handleSaveIndividualGrade(student, labId)}
                                                        size="sm"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleCancelIndividualEdit(individualGradeKey, individualCommentKey)}
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => handleIndividualEditToggle(student, labId)}
                                                    size="sm"
                                                    variant="secondary"
                                                >
                                                    <Edit3 className="h-4 w-4 mr-1" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {teamGradeData.members.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No students found in this team.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}