"use client"

import { useState, useEffect } from "react"
import { updateLab } from "@/services/labServices"
import { searchEquipmentType } from "@/services/equipmentTypeServices"
import { searchKitTemplate } from "@/services/kitTemplateServices"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface Equipment {
    equipmentTypeId: string
    equipmentTypeName: string
}

interface Kit {
    kitTemplateId: string
    kitTemplateName: string
}

interface EditLabProps {
    lab: {
        labId: number
        subjectId: number // Changed from string to number
        labName: string
        labRequest: string
        labTarget: string
        labStatus: string
        requiredEquipments: { equipmentTypeId: string }[]
        requiredKits: { kitTemplateId: string }[]
    } | null
    open: boolean
    onClose: () => void
    onUpdate: () => void
}

export default function EditLab({ lab, open, onClose, onUpdate }: EditLabProps) {
    const [formData, setFormData] = useState({
        subjectId: 0, // Changed from string to number
        labName: "",
        labRequest: "",
        labTarget: "",
        labStatus: "",
        requiredEquipments: [] as string[],
        requiredKits: [] as string[]
    })
    const [equipments, setEquipments] = useState<Equipment[]>([])
    const [kits, setKits] = useState<Kit[]>([])
    const [loading, setLoading] = useState(false)
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
        if (open) {
            fetchData()
        }
    }, [open])

    useEffect(() => {
        if (lab && open) {
            setFormData({
                subjectId: lab.subjectId, // Now a number
                labName: lab.labName,
                labRequest: lab.labRequest,
                labTarget: lab.labTarget,
                labStatus: lab.labStatus,
                requiredEquipments: lab.requiredEquipments.map(eq => eq.equipmentTypeId),
                requiredKits: lab.requiredKits.map(kit => kit.kitTemplateId)
            })
            setError(null)
        }
    }, [lab, open])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "subjectId" ? parseInt(value) || 0 : value // Parse subjectId as number
        }))
    }

    const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            requiredEquipments: checked
                ? [...prev.requiredEquipments, equipmentId]
                : prev.requiredEquipments.filter((id) => id !== equipmentId)
        }))
    }

    const handleKitChange = (kitId: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            requiredKits: checked
                ? [...prev.requiredKits, kitId]
                : prev.requiredKits.filter((id) => id !== kitId)
        }))
    }

    const removeEquipment = (equipmentId: string) => {
        setFormData((prev) => ({
            ...prev,
            requiredEquipments: prev.requiredEquipments.filter((id) => id !== equipmentId)
        }))
    }

    const removeKit = (kitId: string) => {
        setFormData((prev) => ({
            ...prev,
            requiredKits: prev.requiredKits.filter((id) => id !== kitId)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!lab) return

        try {
            setLoading(true)
            setError(null)
            const formattedData = {
                subjectId: formData.subjectId, // Already a number
                labName: formData.labName,
                labRequest: formData.labRequest,
                labTarget: formData.labTarget,
                labStatus: formData.labStatus,
                requiredEquipments: formData.requiredEquipments.map(id => ({ equipmentTypeId: id })),
                requiredKits: formData.requiredKits.map(id => ({ kitTemplateId: id }))
            }
            await updateLab(String(lab.labId), formattedData)
            onUpdate()
            onClose()
        } catch (err: any) {
            setError(err.message || "Failed to update lab")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Lab</DialogTitle>
                    <DialogDescription>Update the details of the lab</DialogDescription>
                </DialogHeader>

                {lab ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Basic Lab Information */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subjectId">Subject ID</Label>
                                    <Input
                                        id="subjectId"
                                        name="subjectId"
                                        type="number" // Changed to number input
                                        value={formData.subjectId}
                                        onChange={handleChange}
                                        placeholder="Enter subject ID"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="labName">Lab Name</Label>
                                    <Input
                                        id="labName"
                                        name="labName"
                                        value={formData.labName}
                                        onChange={handleChange}
                                        placeholder="Enter lab name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="labRequest">Request</Label>
                                    <Textarea
                                        id="labRequest"
                                        name="labRequest"
                                        value={formData.labRequest}
                                        onChange={handleChange}
                                        placeholder="Enter lab request"
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="labTarget">Target</Label>
                                    <Textarea
                                        id="labTarget"
                                        name="labTarget"
                                        value={formData.labTarget}
                                        onChange={handleChange}
                                        placeholder="Enter lab target"
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="labStatus">Status</Label>
                                    <select
                                        id="labStatus"
                                        name="labStatus"
                                        value={formData.labStatus}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column - Equipment and Kits */}
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
                                                                            : "opacity-0"
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
                                                                            : "opacity-0"
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

                        {error && <div className="text-red-500 text-sm mt-4">{error}</div>}

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <p className="text-center text-muted-foreground py-6">No lab data available.</p>
                )}
            </DialogContent>
        </Dialog>
    )
}