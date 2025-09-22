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
import { getAllTeams } from "@/services/teamServices"
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

export default function CreateCheckoutKit({ isOpen, onClose, onSuccess }: CreateCheckoutKitProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        kitName: "",
        groupName: "",
        borrowingGroupName: "",
        notes: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [kitList, setKitList] = useState<Kit[]>([])
    const [teamList, setTeamList] = useState<Team[]>([])
    const [isLoadingKits, setIsLoadingKits] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(false)

    useEffect(() => {
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
                    title: "Lỗi",
                    description: "Không thể tải danh sách bộ thiết bị",
                    variant: "destructive"
                })
            } finally {
                setIsLoadingKits(false)
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
            fetchKits()
            fetchTeams()
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const selectedTeam = teamList.find(team => `${team.teamName} - ${team.className}` === formData.groupName)
            const selectedKit = kitList.find(kit => kit.kitName === formData.kitName)

            if (!selectedTeam || !selectedKit) {
                throw new Error("Vui lòng chọn nhóm và bộ thiết bị hợp lệ")
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
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Không thể tạo bàn giao bộ thiết bị",
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

    const handleKitSelect = (value: string) => {
        setFormData(prev => ({
            ...prev,
            kitName: value
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
                        Bàn Giao Bộ Thiết Bị
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="kitName">Tên bộ thiết bị *</Label>
                                <Select
                                    value={formData.kitName}
                                    onValueChange={handleKitSelect}
                                    disabled={isLoadingKits}
                                >
                                    <SelectTrigger id="kitName">
                                        <SelectValue placeholder={isLoadingKits ? "Đang tải..." : "Chọn tên bộ thiết bị"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kitList.map((kit, index) => (
                                            <SelectItem
                                                key={kit.kitId || `kit-${index}`}
                                                value={kit.kitName}
                                            >
                                                {kit.kitName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        <SelectItem value="no-teams" disabled>
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
                            <Label htmlFor="borrowingGroupName">Tên nhóm mượn bộ thiết bị *</Label>
                            <Input
                                id="borrowingGroupName"
                                value={formData.borrowingGroupName}
                                onChange={(e) => handleInputChange("borrowingGroupName", e.target.value)}
                                placeholder="Nhập tên nhóm mượn bộ thiết bị"
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
                            placeholder="Nhập ghi chú về việc mượn bộ thiết bị..."
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