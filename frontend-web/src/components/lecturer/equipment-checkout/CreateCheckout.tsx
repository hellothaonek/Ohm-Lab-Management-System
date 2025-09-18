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
import { getAllTeams } from "@/services/teamServices"
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
}

interface Team {
    teamId: string
    teamName: string
    className: string
}

export default function CreateCheckout({ isOpen, onClose, onSuccess }: CreateCheckoutProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        equipmentName: "",
        equipmentNumberSerial: "",
        groupName: "",
        borrowingGroupName: "",
        notes: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
    const [teamList, setTeamList] = useState<Team[]>([])
    const [isLoadingEquipment, setIsLoadingEquipment] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(false)

    useEffect(() => {
        const fetchEquipment = async () => {
            setIsLoadingEquipment(true)
            try {
                const response = await searchEquipment({
                    pageNum: 1,
                    pageSize: 100,
                    keyWord: "",
                    status: ""
                })
                setEquipmentList(response.pageData)
            } catch (error) {
                console.error("Error fetching equipment:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách thiết bị",
                    variant: "destructive"
                })
            } finally {
                setIsLoadingEquipment(false)
            }
        }

        const fetchTeams = async () => {
            setIsLoadingTeams(true)
            try {
                const response = await getAllTeams()
                setTeamList(response)
            } catch (error) {
                console.error("Error fetching teams:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách nhóm",
                    variant: "destructive"
                })
                setTeamList([])
            } finally {
                setIsLoadingTeams(false)
            }
        }

        if (isOpen) {
            fetchEquipment()
            fetchTeams()
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const selectedTeam = teamList.find(team => `${team.teamName} - ${team.className}` === formData.groupName)
            const selectedEquipment = equipmentList.find(equipment => equipment.equipmentName === formData.equipmentName)

            if (!selectedTeam || !selectedEquipment) {
                throw new Error("Vui lòng chọn nhóm và thiết bị hợp lệ")
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
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Không thể tạo bàn giao thiết bị",
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
            groupName: "",
            borrowingGroupName: "",
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
                        Bàn Giao Thiết Bị
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="equipmentName">Tên thiết bị *</Label>
                                <Select
                                    value={formData.equipmentName}
                                    onValueChange={handleEquipmentSelect}
                                    disabled={isLoadingEquipment}
                                >
                                    <SelectTrigger id="equipmentName">
                                        <SelectValue placeholder={isLoadingEquipment ? "Đang tải..." : "Chọn tên thiết bị"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {equipmentList.map(equipment => (
                                            <SelectItem key={equipment.equipmentNumberSerial} value={equipment.equipmentName}>
                                                {equipment.equipmentName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="equipmentNumberSerial">Number Serial *</Label>
                                <Input
                                    id="equipmentNumberSerial"
                                    value={formData.equipmentNumberSerial}
                                    onChange={(e) => handleInputChange("equipmentNumberSerial", e.target.value)}
                                    placeholder="Nhập số seri của thiết bị"
                                    required
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Group Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Thông tin nhóm
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="groupName">Nhóm</Label>
                            <Select
                                value={formData.groupName}
                                onValueChange={handleTeamSelect}
                                disabled={isLoadingTeams}
                            >
                                <SelectTrigger id="groupName">
                                    <SelectValue placeholder={isLoadingTeams ? "Đang tải..." : "Chọn nhóm"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamList.length === 0 && !isLoadingTeams && (
                                        <SelectItem value="" disabled>
                                            Không có nhóm nào
                                        </SelectItem>
                                    )}
                                    {teamList.map(team => (
                                        <SelectItem key={`${team.teamName}-${team.className}`} value={`${team.teamName} - ${team.className}`}>
                                            {`${team.teamName} - ${team.className}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="borrowingGroupName">Tên nhóm mượn thiết bị *</Label>
                            <Input
                                id="borrowingGroupName"
                                value={formData.borrowingGroupName}
                                onChange={(e) => handleInputChange("borrowingGroupName", e.target.value)}
                                placeholder="Nhập tên nhóm mượn thiết bị"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Nhập ghi chú về việc mượn thiết bị..."
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
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Đang tạo..." : "Tạo"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}