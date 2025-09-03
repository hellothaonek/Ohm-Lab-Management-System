"use client"

import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { updateClass } from "../../../services/classServices"
import { toast } from "react-toastify"
import { Class, Subject } from "../../../types/class"

interface EditClassProps {
    classItem: Class | null
    subjects: Subject[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function EditClass({ classItem, subjects, isOpen, onOpenChange, onSuccess }: EditClassProps) {
    const [formData, setFormData] = useState({
        subjectId: 0,
        className: "",
        classDescription: "",
        classStatus: "Valid"
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (classItem) {
            setFormData({
                subjectId: classItem.subjectId,
                className: classItem.className,
                classDescription: classItem.classDescription,
                classStatus: classItem.classStatus
            })
        }
    }, [classItem])

    const handleSubmit = async () => {
        if (!subjects || subjects.length === 0) {
            toast.error("No subjects available. Please create subjects first.")
            return
        }
        
        if (!classItem || !formData.subjectId || formData.subjectId === 0 || !formData.className || !formData.classDescription) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            setLoading(true)
            await updateClass(classItem.classId.toString(), formData)
            onOpenChange(false)
            onSuccess()
        } catch (error) {
            console.error("Error updating class:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    if (!classItem) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Class</DialogTitle>
                    <DialogDescription>
                        Update class information
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="edit-subject">Subject *</Label>
                        {subjects && subjects.length > 0 ? (
                            <Select value={formData.subjectId.toString()} onValueChange={(value) => setFormData({ ...formData, subjectId: parseInt(value) })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                                            {subject.subjectName} ({subject.subjectCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <span className="text-muted-foreground">No subjects available</span>
                            </div>
                        )}
                        {(!subjects || subjects.length === 0) && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Please create subjects first before editing classes.
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="edit-className">Class Name *</Label>
                        <Input
                            id="edit-className"
                            value={formData.className}
                            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            placeholder="Enter class name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-classDescription">Description *</Label>
                        <Textarea
                            id="edit-classDescription"
                            value={formData.classDescription}
                            onChange={(e) => setFormData({ ...formData, classDescription: e.target.value })}
                            placeholder="Enter class description"
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-status">Status</Label>
                        <Select value={formData.classStatus} onValueChange={(value) => setFormData({ ...formData, classStatus: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Valid">Valid</SelectItem>
                                <SelectItem value="Invalid">Invalid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Updating..." : "Update Class"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
