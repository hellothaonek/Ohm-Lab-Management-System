"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createTeamGrade, getPendingTeams } from "@/services/gradeServices"
import { PenLine } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Team {
    teamId: string
    teamName: string
}

interface CreateTeamGradeProps {
    labId: string
    classId: string
    teams?: Team[]
    onGradeSubmitted: () => void
}

export default function CreateTeamGrade({ labId, classId, teams = [], onGradeSubmitted }: CreateTeamGradeProps) {
    const [open, setOpen] = useState(false)
    const [grade, setGrade] = useState("")
    const [comment, setComment] = useState("")
    const [selectedTeamId, setSelectedTeamId] = useState("")
    const [pendingTeams, setPendingTeams] = useState<Team[]>(teams)
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(false)

    useEffect(() => {
        if (open) {
            const fetchPendingTeams = async () => {
                setIsLoadingTeams(true)
                try {
                    const response = await getPendingTeams(labId)
                    setPendingTeams(response)
                } catch (error) {
                    console.error("Error fetching pending teams:", error)
                    toast({
                        title: "Error",
                        description: "Failed to load pending teams",
                        variant: "destructive",
                    })
                } finally {
                    setIsLoadingTeams(false)
                }
            }
            fetchPendingTeams()
        }
    }, [open, labId, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const gradeValue = parseFloat(grade)

        // Centralized validation checks
        if (!selectedTeamId) {
            toast({
                title: "Team Not Selected",
                description: "Please select a team before submitting.",
                variant: "destructive",
            })
            setIsSubmitting(false)
            return
        }

        if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
            toast({
                title: "Invalid Grade",
                description: "Please enter a valid grade between 0 and 100.",
                variant: "destructive",
            })
            setIsSubmitting(false)
            return
        }


        try {
            await createTeamGrade(labId, selectedTeamId, {
                grade: gradeValue,
                classId: parseInt(classId),
                gradeDescription: comment,
                gradeStatus: "Graded",
            })

            setOpen(false)
            setGrade("")
            setComment("")
            setSelectedTeamId("")
            onGradeSubmitted()
        } catch (error) {
            console.error("Error submitting grade:", error)
            toast({
                title: "Error",
                description: "Failed to submit grade.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const isFormValid = selectedTeamId && !isNaN(parseFloat(grade)) && parseFloat(grade) >= 0 && parseFloat(grade) <= 100 && comment.trim() !== "";

    return (
        <Dialog open={open} onOpenChange={(open) => {
            setOpen(open)
            if (!open) {
                setGrade("")
                setComment("")
                setSelectedTeamId("")
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="text-sm hover:bg-orange-500">
                    <PenLine className="h-4 w-4 mr-2" />
                    Grade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Grade Team Lab</DialogTitle>
                    <DialogDescription>
                        Select a team and enter the grade and comments for their lab submission. All fields are required.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="team-select" className="text-right">
                                Team
                            </Label>
                            <Select
                                value={selectedTeamId}
                                onValueChange={setSelectedTeamId}
                                required
                                disabled={isLoadingTeams}
                            >
                                <SelectTrigger id="team-select" className="col-span-3">
                                    <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pendingTeams.length > 0 ? (
                                        pendingTeams.map((team) => (
                                            <SelectItem key={team.teamId} value={team.teamId}>
                                                {team.teamName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-teams" disabled>
                                            No pending teams
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="grade" className="text-right">
                                Grade
                            </Label>
                            <Input
                                id="grade"
                                type="number"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter grade (0-100)"
                                min="0"
                                max="100"
                                step="0.1"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="comment" className="text-right">
                                Comment
                            </Label>
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter comments"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isFormValid || isSubmitting || isLoadingTeams}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}