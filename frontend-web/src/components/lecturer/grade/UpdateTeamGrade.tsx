"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateTeamGrade } from "@/services/gradeServices"
import { toast } from "react-toastify"
import { Save, X } from "lucide-react"

interface UpdateTeamGradeProps {
    labId: number
    teamId: number
    initialGrade: number
    initialDescription: string
    onSave: () => void
    onCancel: () => void
}

export function UpdateTeamGrade({ labId, teamId, initialGrade, initialDescription, onSave, onCancel }: UpdateTeamGradeProps) {
    const [grade, setGrade] = useState(initialGrade)
    const [description, setDescription] = useState(initialDescription)

    const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = Number.parseFloat(e.target.value)
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            setGrade(numValue)
        } else if (e.target.value === "") {
            setGrade(0)
        }
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value)
    }

    const handleSave = async () => {
        try {
            await updateTeamGrade(labId, teamId, { grade, description })
            toast.success("Update team grade successful")
            onSave()
        } catch (err) {
            console.error("Error updating grade:", err)
            toast.error("Failed to update grade")
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grade !== 0 ? grade.toString() : ""}
                onChange={handleGradeChange}
                className="w-20 h-9 text-center"
                placeholder="0.0"
            />
            <Textarea
                value={description}
                onChange={handleDescriptionChange}
                className="w-full h-16 text-sm"
                placeholder="Enter comment..."
            />
            <div className="flex gap-2 justify-end">
                <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4" />
                </Button>
                <Button onClick={onCancel} size="sm" variant="outline">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}