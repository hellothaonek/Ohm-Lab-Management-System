"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { searchEquipmentType } from "@/services/equipmentTypeServices"
import { searchKitTemplate } from "@/services/kitTemplateServices"
import { createLab } from "@/services/labServices"

interface Equipment {
    equipmentTypeId: string
    equipmentTypeName: string
}

interface Kit {
    kitTemplateId: string
    kitTemplateName: string
}

interface Lab {
    labId: number
    subjectId: number
    labName: string
    labRequest: string
    labTarget: string
    labStatus: string
    requiredEquipments: { equipmentTypeId: string }[]
    requiredKits: { kitTemplateId: string }[]
}

interface CreateLabForm {
    labName: string
    labRequest: string
    labTarget: string
    labStatus: string
    requiredEquipments: string[]
    requiredKits: string[]
}

interface CreateLabProps {
    subjectId: number
    isOpen: boolean
    onClose: () => void
    onLabCreated: (newLab: Lab) => void
}

const CreateLab: React.FC<CreateLabProps> = ({ subjectId, isOpen, onClose, onLabCreated }) => {
    const [formData, setFormData] = useState<CreateLabForm>({
        labName: "",
        labRequest: "",
        labTarget: "",
        labStatus: "Active",
        requiredEquipments: [],
        requiredKits: [],
    })
    const [equipments, setEquipments] = useState<Equipment[]>([])
    const [kits, setKits] = useState<Kit[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoadingEquipments, setIsLoadingEquipments] = useState(false)
    const [isLoadingKits, setIsLoadingKits] = useState(false)
    const [equipmentSelectorOpen, setEquipmentSelectorOpen] = useState(false)
    const [kitSelectorOpen, setKitSelectorOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingEquipments(true)
            setIsLoadingKits(true)
            try {
                const [equipmentResponse, kitResponse] = await Promise.all([
                    searchEquipmentType({
                        pageNum: 1,
                        pageSize: 100,
                        keyWord: "",
                        status: "",
                    }),
                    searchKitTemplate({
                        pageNum: 1,
                        pageSize: 100,
                        keyWord: "",
                        status: "",
                    }),
                ])
                setEquipments(equipmentResponse.pageData)
                setKits(kitResponse.pageData)
            } catch (err) {
                setError("Failed to load equipments or kits")
            } finally {
                setIsLoadingEquipments(false)
                setIsLoadingKits(false)
            }
        }
        if (isOpen) {
            fetchData()
        }
    }, [isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            requiredEquipments: checked
                ? [...prev.requiredEquipments, equipmentId]
                : prev.requiredEquipments.filter((id) => id !== equipmentId),
        }))
    }

    const handleKitChange = (kitId: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            requiredKits: checked
                ? [...prev.requiredKits, kitId]
                : prev.requiredKits.filter((id) => id !== kitId),
        }))
    }

    const removeEquipment = (equipmentId: string) => {
        setFormData((prev) => ({
            ...prev,
            requiredEquipments: prev.requiredEquipments.filter((id) => id !== equipmentId),
        }))
    }

    const removeKit = (kitId: string) => {
        setFormData((prev) => ({
            ...prev,
            requiredKits: prev.requiredKits.filter((id) => id !== kitId),
        }))
    }

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({ ...prev, labStatus: value }))
    }

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        // Basic validation
        if (!subjectId) {
            setError("Subject ID is required")
            setIsSubmitting(false)
            return
        }
        if (!formData.labName.trim()) {
            setError("Lab Name is required")
            setIsSubmitting(false)
            return
        }

        try {
            const requiredEquipments = formData.requiredEquipments.map((id) => ({
                equipmentTypeId: id,
            }))
            const requiredKits = formData.requiredKits.map((id) => ({
                kitTemplateId: id,
            }))

            const response = await createLab({
                subjectId,
                labName: formData.labName,
                labRequest: formData.labRequest,
                labTarget: formData.labTarget,
                labStatus: formData.labStatus,
                requiredEquipments,
                requiredKits,
            })

            const newLab: Lab = {
                labId: response.labId || 0,
                subjectId,
                labName: formData.labName,
                labRequest: formData.labRequest,
                labTarget: formData.labTarget,
                labStatus: formData.labStatus,
                requiredEquipments,
                requiredKits,
            }
            onLabCreated(newLab)
            setFormData({
                labName: "",
                labRequest: "",
                labTarget: "",
                labStatus: "Active",
                requiredEquipments: [],
                requiredKits: [],
            })
            onClose()
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to create lab"
            setError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Lab</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Right Column - Basic Lab Information */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="labName">Lab Name</Label>
                            <Input
                                id="labName"
                                name="labName"
                                value={formData.labName}
                                onChange={handleInputChange}
                                placeholder="Enter lab name"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="labRequest">Lab Request</Label>
                            <Input
                                id="labRequest"
                                name="labRequest"
                                value={formData.labRequest}
                                onChange={handleInputChange}
                                placeholder="Enter lab request"
                            />
                        </div>
                        <div>
                            <Label htmlFor="labTarget">Lab Target</Label>
                            <Input
                                id="labTarget"
                                name="labTarget"
                                value={formData.labTarget}
                                onChange={handleInputChange}
                                placeholder="Enter lab target"
                            />
                        </div>
                        <div>
                            <Label htmlFor="labStatus">Status</Label>
                            <Select value={formData.labStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger id="labStatus">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Left Column - Equipment and Kits */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Required Equipments</Label>
                            <Popover open={equipmentSelectorOpen} onOpenChange={setEquipmentSelectorOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={equipmentSelectorOpen}
                                        className="w-full justify-between min-h-10 bg-transparent"
                                        disabled={isLoadingEquipments}
                                    >
                                        {formData.requiredEquipments.length === 0
                                            ? "Select equipments..."
                                            : `${formData.requiredEquipments.length} equipment${formData.requiredEquipments.length > 1 ? "s" : ""} selected`}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="center">
                                    <Command>
                                        <CommandInput placeholder="Search equipments..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                {isLoadingEquipments ? "Loading equipments..." : "No equipments found."}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {equipments.map((equipment) => (
                                                    <CommandItem
                                                        key={equipment.equipmentTypeId}
                                                        value={equipment.equipmentTypeId}
                                                        onSelect={() => {
                                                            const isSelected = formData.requiredEquipments.includes(equipment.equipmentTypeId)
                                                            handleEquipmentChange(equipment.equipmentTypeId, !isSelected)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.requiredEquipments.includes(equipment.equipmentTypeId)
                                                                    ? "opacity-100"
                                                                    : "opacity-0",
                                                            )}
                                                        />
                                                        {equipment.equipmentTypeName}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {formData.requiredEquipments.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50">
                                    {formData.requiredEquipments.map((equipmentId) => {
                                        const equipment = equipments.find(e => e.equipmentTypeId === equipmentId)
                                        return (
                                            <Badge key={equipmentId} variant="secondary" className="flex items-center gap-1 pr-1">
                                                <span className="truncate max-w-32">{equipment?.equipmentTypeName || equipmentId}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                    onClick={() => removeEquipment(equipmentId)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Required Kits</Label>
                            <Popover open={kitSelectorOpen} onOpenChange={setKitSelectorOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={kitSelectorOpen}
                                        className="w-full justify-between min-h-10 bg-transparent"
                                        disabled={isLoadingKits}
                                    >
                                        {formData.requiredKits.length === 0
                                            ? "Select kits..."
                                            : `${formData.requiredKits.length} kit${formData.requiredKits.length > 1 ? "s" : ""} selected`}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="center">
                                    <Command>
                                        <CommandInput placeholder="Search kits..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                {isLoadingKits ? "Loading kits..." : "No kits found."}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {kits.map((kit) => (
                                                    <CommandItem
                                                        key={kit.kitTemplateId}
                                                        value={kit.kitTemplateId}
                                                        onSelect={() => {
                                                            const isSelected = formData.requiredKits.includes(kit.kitTemplateId)
                                                            handleKitChange(kit.kitTemplateId, !isSelected)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.requiredKits.includes(kit.kitTemplateId)
                                                                    ? "opacity-100"
                                                                    : "opacity-0",
                                                            )}
                                                        />
                                                        {kit.kitTemplateName}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {formData.requiredKits.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50">
                                    {formData.requiredKits.map((kitId) => {
                                        const kit = kits.find(k => k.kitTemplateId === kitId)
                                        return (
                                            <Badge key={kitId} variant="secondary" className="flex items-center gap-1 pr-1">
                                                <span className="truncate max-w-32">{kit?.kitTemplateName || kitId}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                    onClick={() => removeKit(kitId)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateLab