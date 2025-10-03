"use client"

import { useState, useEffect, ReactNode } from "react"
import { getLabById } from "@/services/labServices"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

// --- Reusable Badge Component ---
const LabBadge = ({ children }: { children: ReactNode }) => (
    // Gray Badge for contrast against the light blue content box
    <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full mr-2 mb-2">
        {children}
    </span>
)
// ---------------------------------

// --- DetailItem Component ---
interface DetailItemProps {
    title: string
    content: ReactNode
}

const DetailItem = ({ title, content }: DetailItemProps) => (
    <div className="space-y-1">
        <div className="text-sm font-bold text-gray-700">
            {title}:
        </div>
        {/* Content Box with light blue background */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg break-all whitespace-pre-line text-sm text-gray-800">
            {content}
        </div>
    </div>
)
// ----------------------------------------------------


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
                    setLab(res)
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
            {/* Added max-h-[90vh] and overflow-y-auto to DialogContent for better overall handling */}
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader className="flex-shrink-0"> {/* Ensure Header doesn't shrink, keeping it visible */}
                    <DialogTitle className="text-xl font-extrabold">
                        {lab ? lab.labName : "Lab Detail"}
                    </DialogTitle>
                    <DialogDescription>Detail information about this lab</DialogDescription>
                </DialogHeader>

                {/* This is the main content area that needs to be scrollable if its children are too tall */}
                <div className="flex-grow overflow-y-auto pt-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                            <p>Loading lab details...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-6">{error}</div>
                    ) : lab ? (
                        // Content container for all DetailItems
                        <div className="space-y-4">

                            {/* Request */}
                            <DetailItem
                                title="Request"
                                content={lab.labRequest}
                            />

                            {/* Target */}
                            <DetailItem
                                title="Target"
                                content={lab.labTarget}
                            />

                            {/* Equipments (Using Gray Badges) */}
                            <DetailItem
                                title="Required Equipments"
                                content={
                                    lab.requiredEquipments.length > 0
                                        ? lab.requiredEquipments.map((e, index) => (
                                            <LabBadge key={index}>{e.equipmentTypeName}</LabBadge>
                                        ))
                                        : <div className="text-gray-500">None</div>
                                }
                            />

                            {/* Kits (Using Gray Badges) */}
                            <DetailItem
                                title="Required Kits"
                                content={
                                    lab.requiredKits.length > 0
                                        ? lab.requiredKits.map((k, index) => (
                                            <LabBadge key={index}>{k.kitTemplateName}</LabBadge>
                                        ))
                                        : <div className="text-gray-500">None</div>
                                }
                            />

                            {/* Status */}
                            <DetailItem
                                title="Status"
                                content={lab.labStatus}
                            />

                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-6">No lab data available. Select a lab to view details.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}