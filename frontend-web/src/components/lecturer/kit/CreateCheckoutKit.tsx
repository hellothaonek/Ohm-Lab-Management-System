"use client"

import { useState, useEffect } from "react"
import { X, Package, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { searchKit } from "@/services/kitServices"
import { getTeamsByClassId } from "@/services/teamServices"
import { getClassByLecturerId } from "@/services/classServices"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { borrowTeamKit } from "@/services/teamKitServices"

interface CreateCheckoutKitProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (checkout: any) => void
}

interface Kit {
    kitId: string
    kitName: string
    kitStatus: string
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

export default function CreateCheckoutKit({ isOpen, onClose, onSuccess }: CreateCheckoutKitProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        kitName: "",
        classId: "",
        groupName: "",
        borrowingGroupName: "Checkout Kit",
        notes: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [kitList, setKitList] = useState<Kit[]>([])
    const [teamList, setTeamList] = useState<Team[]>([])
    const [classList, setClassList] = useState<Class[]>([])
    const [isLoadingKits, setIsLoadingKits] = useState(false)
    const [isLoadingClasses, setIsLoadingClasses] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(false)

    useEffect(() => {
        const lecturerId = user?.userId
        const fetchKits = async () => {
            setIsLoadingKits(true)
            try {
                const response = await searchKit({
                    pageNum: 1,
                    pageSize: 100,
                    keyWord: "",
                    status: ""
                })
                const validKits = response.pageData.filter((kit: Kit) => kit.kitStatus === "Valid")
                setKitList(validKits)
            } catch (error) {
                console.error("Error fetching kits:", error)
                toast({
                    title: "Error",
                    description: "Failed to load kit list",
                    variant: "destructive"
                })
            } finally {
                setIsLoadingKits(false)
            }
        }

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
            fetchKits()
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const selectedTeam = teamList.find(team => team.teamName === formData.groupName)
            const selectedKit = kitList.find(kit => kit.kitName === formData.kitName)

            if (!selectedTeam || !selectedKit) {
                throw new Error("Please select a valid team and kit")
            }

            const checkoutData = {
                teamId: Number(selectedTeam.teamId),
                kitId: selectedKit.kitId,
                teamKitName: formData.borrowingGroupName,
                teamKitDescription: formData.notes
            }

            const response = await borrowTeamKit(checkoutData)
            onSuccess(response)
            handleClose()
            resetForm()
        } catch (error) {
            console.error("Error creating kit checkout:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create kit checkout",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            onClose()
            resetForm()
        }
    }

    const resetForm = () => {
        setFormData({
            kitName: "",
            classId: "",
            groupName: "",
            borrowingGroupName: "Checkout Kit",
            notes: ""
        })
        setTeamList([])
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleKitSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            kitName: value
        }))
    }

    const handleClassSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            classId: value,
            groupName: "" // Reset team selection when class changes
        }))
    }

    const handleTeamSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            groupName: value
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Create Kit Checkout
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="kitName">Kit Name *</Label>
                                <Select
                                    value={formData.kitName}
                                    onValueChange={handleKitSelect}
                                    disabled={isLoadingKits}
                                >
                                    <SelectTrigger id="kitName">
                                        <SelectValue placeholder={isLoadingKits ? "Loading..." : "Select kit name"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kitList.length === 0 && !isLoadingKits ? (
                                            <SelectItem value="no-kits" disabled>
                                                No kits available
                                            </SelectItem>
                                        ) : (
                                            kitList.map((kit, index) => (
                                                <SelectItem
                                                    key={kit.kitId || `kit-${index}`}
                                                    value={kit.kitName}
                                                >
                                                    {kit.kitName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Team Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Team Information
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="classId">Class *</Label>
                            <Select
                                value={formData.classId}
                                onValueChange={handleClassSelect}
                                disabled={isLoadingClasses}
                            >
                                <SelectTrigger id="classId">
                                    <SelectValue placeholder={isLoadingClasses ? "Loading..." : "Select class"} />
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

                        <div className="space-y-2">
                            <Label htmlFor="groupName">Team</Label>
                            <Select
                                value={formData.groupName}
                                onValueChange={handleTeamSelect}
                                disabled={isLoadingTeams || !formData.classId}
                            >
                                <SelectTrigger id="groupName">
                                    <SelectValue placeholder={isLoadingTeams ? "Loading..." : formData.classId ? "Select team" : "Select a class first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamList.length === 0 && !isLoadingTeams ? (
                                        <SelectItem value="no-teams" disabled>
                                            No teams available
                                        </SelectItem>
                                    ) : (
                                        teamList.map(team => (
                                            <SelectItem key={team.teamId} value={team.teamName}>
                                                {team.teamName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Enter notes about the kit borrowing..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600"
                            disabled={isSubmitting || !formData.kitName || !formData.groupName || !formData.classId}
                        >
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}