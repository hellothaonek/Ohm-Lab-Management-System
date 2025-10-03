"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTeamGrade, getPendingTeams } from "@/services/gradeServices"
import { toast } from "react-toastify"
import { Team, Lab } from "./GradeTab"

interface CreateTeamGradeProps {
    classId: string
    teams: Team[]
    labs: Lab[]
    onGradeCreated: (newGrade: { labId: number; teamId: number; grade: number; gradeDescription: string; gradeStatus: string }) => void
}

export function CreateTeamGrade({ classId, teams, labs, onGradeCreated }: CreateTeamGradeProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTeamId, setSelectedTeamId] = useState<string>("")
    const [selectedLabId, setSelectedLabId] = useState<string>("")
    const [grade, setGrade] = useState<string>("")
    const [gradeDescription, setGradeDescription] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pendingTeams, setPendingTeams] = useState<Team[]>([])
    const [isLoadingTeams, setIsLoadingTeams] = useState(false)

    useEffect(() => {
        const fetchPendingTeams = async () => {
            if (selectedLabId) {
                try {
                    setIsLoadingTeams(true)
                    const response = await getPendingTeams(selectedLabId)
                    setPendingTeams(response || [])
                    setSelectedTeamId("") 
                } catch (error) {
                    console.error("Error fetching pending teams:", error)
                    toast.error("Failed to fetch pending teams")
                    setPendingTeams([])
                } finally {
                    setIsLoadingTeams(false)
                }
            } else {
                setPendingTeams([])
                setSelectedTeamId("")
            }
        }

        fetchPendingTeams()
    }, [selectedLabId])

    const handleSubmit = async () => {
        if (!selectedTeamId || !selectedLabId || !grade) {
            toast.error("Please fill in all required fields")
            return
        }

        const gradeValue = Number.parseFloat(grade)
        if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
            toast.error("Grade must be a number between 0 and 10")
            return
        }

        try {
            setIsSubmitting(true)
            await createTeamGrade(selectedLabId, selectedTeamId, {
                grade: gradeValue,
                classId: Number(classId),
                gradeDescription,
                gradeStatus: "graded",
            })

            onGradeCreated({
                labId: Number(selectedLabId),
                teamId: Number(selectedTeamId),
                grade: gradeValue,
                gradeDescription,
                gradeStatus: "graded",
            })

            setIsOpen(false)
            setSelectedTeamId("")
            setSelectedLabId("")
            setGrade("")
            setGradeDescription("")
        } catch (error) {
            console.error("Error creating team grade:", error)
            toast.error("Failed to create team grade")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <Button onClick={() => setIsOpen(true)} variant="default">
                Create Team Grade
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Team Grade</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">Lab</label>
                            <Select value={selectedLabId} onValueChange={setSelectedLabId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Lab" />
                                </SelectTrigger>
                                <SelectContent>
                                    {labs.map((lab) => (
                                        <SelectItem key={lab.labId} value={lab.labId.toString()}>
                                            {lab.labName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Team</label>
                            <Select
                                value={selectedTeamId}
                                onValueChange={setSelectedTeamId}
                                disabled={!selectedLabId || isLoadingTeams}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingTeams ? "Loading teams..." : "Select Team"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {pendingTeams.length > 0 ? (
                                        pendingTeams.map((team) => (
                                            <SelectItem key={team.teamId} value={team.teamId?.toString() || ""}>
                                                {team.teamName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-teams" disabled>
                                            No pending teams available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Grade (0-10)</label>
                            <Input
                                type="number"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="Enter grade"
                                disabled={!selectedTeamId}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Comment</label>
                            <Textarea
                                value={gradeDescription}
                                onChange={(e) => setGradeDescription(e.target.value)}
                                placeholder="Enter grade comment"
                                rows={4}
                                disabled={!selectedTeamId}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedTeamId}
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}