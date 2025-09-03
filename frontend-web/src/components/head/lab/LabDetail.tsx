"use client"

import { useState, useEffect } from "react"
import { getLabById } from "@/services/labServices"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, ClipboardList, Target, Cpu, Package, Clock } from "lucide-react"

interface LabDetailProps {
    labId: number | null
    open: boolean
    onClose: () => void
}

interface Lab {
    labId: number
    subjectId: number
    labName: string
    labRequest: string
    labTarget: string
    labStatus: string
    totalSlots: number
    requiredEquipments: {
        equipmentTypeName: string
    }[]
    requiredKits: {
        kitTemplateName: string
    }[]
}

export default function LabDetail({ labId, open, onClose }: LabDetailProps) {
    const [lab, setLab] = useState<Lab | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open && labId) {
            const fetchLab = async () => {
                try {
                    setLoading(true)
                    setError(null)
                    const res = await getLabById(String(labId))
                    setLab(res) // API trả về { code, success, message, data } → lấy res.data
                } catch (err: any) {
                    setError(err.message || "Failed to fetch lab detail")
                } finally {
                    setLoading(false)
                }
            }
            fetchLab()
        }
    }, [labId, open])

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {lab ? lab.labName : "Lab Detail"}
                    </DialogTitle>
                    <DialogDescription>Detail information about this lab</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-green-500" />
                        <p>Loading...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-6">{error}</div>
                ) : lab ? (
                    <div className="space-y-3 text-sm">
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-blue-500" />
                                <span className="font-semibold">Request:</span>
                            </div>
                            <div className="break-all whitespace-pre-line">{lab.labRequest}</div>
                        </div>

                        {/* Target */}
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-green-500" />
                                <span className="font-semibold">Target:</span>
                            </div>
                            <div className="break-all whitespace-pre-line">{lab.labTarget}</div>
                        </div>

                        {/* Equipments */}
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold">Equipments:</span>
                            </div>
                            <div className="break-all whitespace-pre-line">
                                {lab.requiredEquipments.length > 0
                                    ? lab.requiredEquipments.map((e) => e.equipmentTypeName).join(", ")
                                    : "None"}
                            </div>
                        </div>

                        {/* Kits */}
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-pink-500" />
                                <span className="font-semibold">Kits:</span>
                            </div>
                            <div className="break-all whitespace-pre-line">
                                {lab.requiredKits.length > 0
                                    ? lab.requiredKits.map((k) => k.kitTemplateName).join(", ")
                                    : "None"}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-6">No lab data available.</p>
                )}
            </DialogContent>
        </Dialog>
    )
}
