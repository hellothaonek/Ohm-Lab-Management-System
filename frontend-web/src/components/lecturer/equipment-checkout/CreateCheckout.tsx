"use client"

import { useState, useEffect } from "react"
import { X, Package, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { searchEquipment } from "@/services/equipmentServices"
import { getTeamsByClassId } from "@/services/teamServices"
import { getClassByLecturerId } from "@/services/classServices"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { borrowEquipment } from "@/services/teamEquipmentServices"

interface CreateCheckoutProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (checkout: any) => void
}

interface Equipment {
    equipmentId: string
    equipmentName: string
    equipmentNumberSerial: string
    equipmentStatus: string
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

export default function CreateCheckout({ isOpen, onClose, onSuccess }: CreateCheckoutProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        equipmentName: "",
        equipmentNumberSerial: "",
        classId: "",
        groupName: "",
        borrowingGroupName: "Checkout Equipment",
        notes: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
    const [teamList, setTeamList] = useState<Team[]>([])
    const [classList, setClassList] = useState<Class[]>([])
    const [isLoadingEquipment, setIsLoadingEquipment] = useState(false)
    const [isLoadingClasses, setIsLoadingClasses] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(false)

    useEffect(() => {
        const lecturerId = user?.userId
        const fetchEquipment = async () => {
            setIsLoadingEquipment(true)
            try {
                const response = await searchEquipment({
                    pageNum: 1,
                    pageSize: 100,
                    keyWord: "",
                    status: ""
                })
                const availableEquipment = response.pageData.filter(
                    (equipment: Equipment) => equipment.equipmentStatus === "Available"
                )
                setEquipmentList(availableEquipment)
            } catch (error) {
                console.error("Error fetching equipment:", error)
                toast({
                    title: "Error",
                    description: "Failed to load equipment list",
                    variant: "destructive"
                })
            } finally {
                setIsLoadingEquipment(false)
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
            fetchEquipment()
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
            const selectedEquipment = equipmentList.find(equipment => equipment.equipmentName === formData.equipmentName)

            if (!selectedTeam || !selectedEquipment) {
                throw new Error("Please select a valid team and equipment")
            }

            const checkoutData = {
                teamId: selectedTeam.teamId,
                equipmentId: selectedEquipment.equipmentId || selectedEquipment.equipmentNumberSerial,
                teamEquipmentName: formData.borrowingGroupName,
                teamEquipmentDescription: formData.notes
            }

            const response = await borrowEquipment(checkoutData)
            onSuccess(response)
            handleClose()
            resetForm()
        } catch (error) {
            console.error("Error creating checkout:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create equipment checkout",
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
            equipmentName: "",
            equipmentNumberSerial: "",
            classId: "",
            groupName: "",
            borrowingGroupName: "Checkout Equipment",
            notes: ""
        })
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleEquipmentSelect = (value: string) => {
        const selectedEquipment = equipmentList.find(equipment => equipment.equipmentName === value)
        setFormData(prev => ({
            ...prev,
            equipmentName: value,
            equipmentNumberSerial: selectedEquipment ? selectedEquipment.equipmentNumberSerial : prev.equipmentNumberSerial
        }))
    }

    const handleClassSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            classId: value,
            groupName: "" 
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
                        Create Equipment Checkout
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="equipmentName">Equipment Name *</Label>
                                <Select
                                    value={formData.equipmentName}
                                    onValueChange={handleEquipmentSelect}
                                    disabled={isLoadingEquipment}
                                >
                                    <SelectTrigger id="equipmentName">
                                        <SelectValue placeholder={isLoadingEquipment ? "Loading..." : "Select equipment name"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {equipmentList.length === 0 && !isLoadingEquipment ? (
                                            <SelectItem value="no-equipment" disabled>
                                                No equipment available
                                            </SelectItem>
                                        ) : (
                                            equipmentList.map(equipment => (
                                                <SelectItem key={equipment.equipmentNumberSerial} value={equipment.equipmentName}>
                                                    {equipment.equipmentName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="equipmentNumberSerial">Serial Number *</Label>
                                <Input
                                    id="equipmentNumberSerial"
                                    value={formData.equipmentNumberSerial}
                                    onChange={(e) => handleInputChange("equipmentNumberSerial", e.target.value)}
                                    placeholder="Enter equipment serial number"
                                    required
                                    readOnly
                                />
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
                            placeholder="Enter notes about the equipment borrowing..."
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
                            disabled={isSubmitting || !formData.equipmentName || !formData.groupName || !formData.classId}
                        >
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}