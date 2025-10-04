"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { borrowTeamKit } from "@/services/teamKitServices"
import { getClassByLecturerId } from "@/services/classServices"
import { getTeamsByClassId } from "@/services/teamServices"
import { useAuth } from "@/context/AuthContext"

interface CheckoutKitProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    kit: { kitId: string; kitName: string } | null
    onSuccess: () => Promise<void>
}

interface Team {
    teamId: string
    teamName: string
    className: string
}

interface Class {
    classId: string
    className: string
    classStatus: string
}

export default function CheckoutKit({ isOpen, onOpenChange, kit, onSuccess }: CheckoutKitProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        classId: "",
        teamId: "",
        teamKitName: "",
        teamKitDescription: ""
    })
    const [classList, setClassList] = useState<Class[]>([])
    const [teamList, setTeamList] = useState<Team[]>([])
    const [isLoadingClasses, setIsLoadingClasses] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(false)

    useEffect(() => {
        if (kit) {
            setFormData(prev => ({
                ...prev,
                teamKitName: kit.kitName,
                teamKitDescription: ""
            }))
        }
    }, [kit])

    useEffect(() => {
        const lecturerId = user?.userId
        const fetchClasses = async () => {
            if (!lecturerId) {
                toast({
                    title: "Error",
                    description: "User ID not found",
                    variant: "destructive"
                })
                setClassList([])
                return
            }
            setIsLoadingClasses(true)
            try {
                const response = await getClassByLecturerId(lecturerId)
                const activeClasses = response.filter((cls: Class) => cls.classStatus === "Active")
                setClassList(activeClasses)
            } catch (error) {
                console.error("Error fetching classes:", error)
                toast({
                    title: "Error",
                    description: "Failed to load class list",
                    variant: "destructive"
                })
                setClassList([])
            } finally {
                setIsLoadingClasses(false)
            }
        }

        if (isOpen) {
            fetchClasses()
        }
    }, [isOpen, user])

    useEffect(() => {
        const fetchTeams = async () => {
            if (formData.classId) {
                setIsLoadingTeams(true)
                try {
                    const response = await getTeamsByClassId(formData.classId)
                    setTeamList(response)
                } catch (error) {
                    console.error("Error fetching teams:", error)
                    toast({
                        title: "Error",
                        description: "Failed to load team list",
                        variant: "destructive"
                    })
                    setTeamList([])
                } finally {
                    setIsLoadingTeams(false)
                }
            } else {
                setTeamList([])
            }
        }

        fetchTeams()
    }, [formData.classId])

    const handleCheckoutSubmit = async () => {
        if (!kit?.kitId || !formData.teamId || !formData.classId) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select a class, team, and provide all required fields.",
            })
            return
        }

        try {
            await borrowTeamKit({
                teamId: Number(formData.teamId),
                kitId: kit.kitId,
                teamKitName: formData.teamKitName,
                teamKitDescription: formData.teamKitDescription
            })

            setFormData({
                classId: "",
                teamId: "",
                teamKitName: "",
                teamKitDescription: ""
            })
            setTeamList([])
            await onSuccess()
            onOpenChange(false)
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to borrow kit"
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage
            })
            console.error("Error borrowing kit:", err)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleClassSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            classId: value,
            teamId: "" // Reset team selection when class changes
        }))
    }

    const handleTeamSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            teamId: value
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Checkout Kit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Class
                        </label>
                        <Select
                            value={formData.classId}
                            onValueChange={handleClassSelect}
                            disabled={isLoadingClasses}
                        >
                            <SelectTrigger id="classId">
                                <SelectValue placeholder={isLoadingClasses ? "Loading..." : "Select a class"} />
                            </SelectTrigger>
                            <SelectContent>
                                {classList.length === 0 && !isLoadingClasses ? (
                                    <SelectItem value="no-classes" disabled>
                                        No classes available
                                    </SelectItem>
                                ) : (
                                    classList.map(cls => (
                                        <SelectItem key={cls.classId} value={cls.classId}>
                                            {cls.className}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Team
                        </label>
                        <Select
                            value={formData.teamId}
                            onValueChange={handleTeamSelect}
                            disabled={isLoadingTeams || !formData.classId}
                        >
                            <SelectTrigger id="teamId">
                                <SelectValue placeholder={isLoadingTeams ? "Loading..." : formData.classId ? "Select a team" : "Select a class first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {teamList.length === 0 && !isLoadingTeams ? (
                                    <SelectItem value="no-teams" disabled>
                                        No teams available
                                    </SelectItem>
                                ) : (
                                    teamList.map(team => (
                                        <SelectItem key={team.teamId} value={team.teamId}>
                                            {team.teamName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="teamKitName" className="block text-sm font-medium text-gray-700 mb-2">
                            Kit Name
                        </label>
                        <Input
                            id="teamKitName"
                            value={formData.teamKitName}
                            onChange={(e) => handleInputChange("teamKitName", e.target.value)}
                            placeholder="Enter kit name"
                            disabled
                        />
                    </div>
                    <div>
                        <label htmlFor="teamKitDescription" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <Input
                            id="teamKitDescription"
                            value={formData.teamKitDescription}
                            onChange={(e) => handleInputChange("teamKitDescription", e.target.value)}
                            placeholder="Enter description"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCheckoutSubmit}
                        disabled={!formData.classId || !formData.teamId || !formData.teamKitName}
                    >
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}