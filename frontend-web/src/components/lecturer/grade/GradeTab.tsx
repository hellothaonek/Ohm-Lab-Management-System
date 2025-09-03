"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, GraduationCap, ChevronDown, ChevronRight, ClipboardPen, PenLine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getLabByClassById } from "@/services/labServices"
import { getGradeForLabId } from "@/services/gradeServices"
import { getTeamsByClassId } from "@/services/teamServices" // Assuming this service exists
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import CreateTeamGrade from "@/components/lecturer/grade/CreateTeamGrade"

interface Team {
    teamId: string
    teamName: string
}

interface Lab {
    labId: number
    labName: string
}

interface Member {
    studentId: string
    studentName: string
    individualGrade: number
    individualComment: string
}

interface TeamGradeData {
    teamId: string // Changed to string to match CreateTeamGrade
    teamName: string
    labId: number
    labName: string
    teamGrade: number
    teamComment: string
    members: Member[]
    gradedDate: string
    gradeStatus: "Graded" | "Not Graded"
}

interface GradeTabProps {
    classId: string
}

export default function GradeTab({ classId }: GradeTabProps) {
    const [gradesData, setGradesData] = useState<{ [key: string]: TeamGradeData }>({})
    const [labs, setLabs] = useState<Lab[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedLabs, setExpandedLabs] = useState<Set<number>>(new Set())
    const [openGradeDialog, setOpenGradeDialog] = useState(false)
    const [selectedLabId, setSelectedLabId] = useState<number | null>(null)
    const { toast } = useToast()

    const fetchLabsAndGrades = async () => {
        try {
            // Fetch labs
            const labResult = await getLabByClassById(classId)
            console.log("GradeTab Labs:", labResult)
            if (labResult) {
                const fetchedLabs = labResult.pageData.map((lab: any) => ({
                    labId: lab.labId,
                    labName: lab.labName,
                }))
                setLabs(fetchedLabs)

                // Fetch teams
                try {
                    const teamResult = await getTeamsByClassId(classId)
                    console.log("GradeTab Teams:", teamResult)
                    const fetchedTeams = teamResult ? teamResult.map((team: any) => ({
                        teamId: team.teamId.toString(), // Ensure teamId is string
                        teamName: team.teamName,
                    })) : []
                    setTeams(fetchedTeams)
                } catch (error) {
                    console.log("Error fetching teams:", error)
                    toast({
                        title: "Warning",
                        description: "Failed to load teams, grading may be limited",
                        variant: "destructive",
                    })
                    setTeams([])
                }

                // Fetch grades for each lab
                const gradesPromises = fetchedLabs.map(async (lab: Lab) => {
                    try {
                        const gradeResult = await getGradeForLabId(lab.labId.toString())
                        console.log(`GradeTab Grades for Lab ${lab.labId}:`, JSON.stringify(gradeResult, null, 2))
                        if (gradeResult) {
                            return gradeResult.map((grade: any) => ({
                                teamId: grade.teamId.toString(), // Ensure teamId is string
                                teamName: grade.teamName,
                                labId: lab.labId,
                                labName: lab.labName,
                                teamGrade: grade.teamGrade || 0,
                                teamComment: grade.teamComment || "",
                                members: grade.members || [],
                                gradedDate: grade.gradedDate || new Date().toISOString(),
                                gradeStatus: grade.teamGrade !== undefined ? "Graded" : "Not Graded",
                            }))
                        }
                        return []
                    } catch (error) {
                        console.log(`Error fetching grades for lab ${lab.labId}:`, error)
                        return []
                    }
                })

                const gradesArrays = await Promise.all(gradesPromises)
                const allGrades = gradesArrays.flat()
                const newGradesData: { [key: string]: TeamGradeData } = {}
                allGrades.forEach((grade: TeamGradeData) => {
                    const key = `${grade.teamId}-${grade.labId}`
                    newGradesData[key] = grade
                })
                setGradesData(newGradesData)
            } else {
                throw new Error("Failed to fetch labs")
            }
        } catch (error) {
            console.log("[v0] Error fetching labs, teams, or grades:", error)
            toast({
                title: "Error",
                description: "Failed to load labs, teams, or grades",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLabsAndGrades()
    }, [classId])

    const toggleLabExpansion = (labId: number) => {
        setExpandedLabs((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(labId)) {
                newSet.delete(labId)
            } else {
                newSet.add(labId)
            }
            return newSet
        })
    }

    const handleGradeForLab = (labId: number) => {
        if (teams.length === 0) {
            toast({
                title: "No Teams Available",
                description: "Cannot grade because no teams are available for this class",
                variant: "destructive",
            })
            return
        }
        setSelectedLabId(labId)
        setOpenGradeDialog(true)
    }

    const handleGradeSubmitted = () => {
        setOpenGradeDialog(false)
        setSelectedLabId(null)
        fetchLabsAndGrades() // Refresh grades data after submission
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading grades...</p>
                </div>
            </div>
        )
    }

    if (!labs.length) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">No labs available</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {labs.map((lab) => {
                const isExpanded = expandedLabs.has(lab.labId)
                const labGrades = Object.values(gradesData).filter((grade) => grade.labId === lab.labId)
                const gradedCount = labGrades.filter((grade) => grade.gradeStatus === "Graded").length
                const totalTeams = labGrades.length

                return (
                    <div key={lab.labId}>
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-6 bg-card border-b border-border bg-secondary">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleLabExpansion(lab.labId)}
                                        className="p-2 h-auto rounded-full hover:bg-accent/10 transition-colors"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-card-foreground">{lab.labName}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Lab Assignment Grades</p>
                                        </div>
                                    </div>

                                    <Badge variant="secondary" className="ml-2 bg-green-500">
                                        {gradedCount} graded
                                    </Badge>
                                </div>

                                <Dialog open={openGradeDialog && selectedLabId === lab.labId} onOpenChange={(open) => {
                                    setOpenGradeDialog(open)
                                    if (!open) setSelectedLabId(null)
                                }}>
                                    <CreateTeamGrade
                                        labId={lab.labId.toString()}
                                        classId={classId}
                                        teams={teams}
                                        onGradeSubmitted={handleGradeSubmitted}
                                    />
                                </Dialog>
                            </div>
                            {isExpanded && (
                                <div className="p-6 bg-background">
                                    <div className="rounded-md border overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="font-semibold">STT</TableHead>
                                                    <TableHead className="font-semibold">Team Name</TableHead>
                                                    <TableHead className="font-semibold text-center">Grade</TableHead>
                                                    <TableHead className="font-semibold text-center">Comment</TableHead>
                                                    <TableHead className="font-semibold text-center">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {labGrades.length > 0 ? (
                                                    labGrades.map((grade, index) => (
                                                        <TableRow key={`${grade.teamId}-${grade.labId}`}>
                                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                                            <TableCell className="font-medium">{grade.teamName}</TableCell>
                                                            <TableCell className="text-center">{grade.teamGrade}</TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="text-sm text-muted-foreground truncate block">
                                                                    {grade.teamComment}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge
                                                                    variant={
                                                                        grade.gradeStatus === "Graded"
                                                                            ? "default"
                                                                            : "destructive"
                                                                    }
                                                                >
                                                                    {grade.gradeStatus}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center">
                                                            <div className="flex flex-col items-center justify-center h-full">
                                                                <div className="w-12 h-12 rounded-full border-2 border-muted flex items-center justify-center mb-2">
                                                                    <ClipboardPen className="h-6 w-6 text-muted-foreground" />
                                                                </div>
                                                                <span className="text-muted-foreground">No grades available for this lab</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </div>
                )
            })}
        </div>
    )
}