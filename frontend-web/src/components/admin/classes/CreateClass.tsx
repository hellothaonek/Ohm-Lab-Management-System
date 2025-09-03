"use client"

import { useState } from "react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Plus } from "lucide-react"
import { createClass } from "../../../services/classServices"
import { toast } from "react-toastify"
import { Subject } from "../../../types/class"

interface CreateClassProps {
    subjects: Subject[]
    onSuccess: () => void
}

export default function CreateClass({ subjects, onSuccess }: CreateClassProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        subjectId: 0,
        className: "",
        classDescription: ""
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!subjects || subjects.length === 0) {
            toast.error("No subjects available. Please create subjects first.")
            return
        }
        
        if (!formData.subjectId || formData.subjectId === 0 || !formData.className || !formData.classDescription) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            setLoading(true)
            await createClass(formData)
            setIsOpen(false)
            setFormData({ subjectId: 0, className: "", classDescription: "" })
            onSuccess()
        } catch (error) {
            console.error("Error creating class:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setIsOpen(false)
        setFormData({ subjectId: 0, className: "", classDescription: "" })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Class
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                    <DialogDescription>
                        Add a new class to the system
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="subject">Subject *</Label>
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
                                Please create subjects first before creating classes.
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="className">Class Name *</Label>
                        <Input
                            id="className"
                            value={formData.className}
                            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            placeholder="Enter class name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="classDescription">Description *</Label>
                        <Textarea
                            id="classDescription"
                            value={formData.classDescription}
                            onChange={(e) => setFormData({ ...formData, classDescription: e.target.value })}
                            placeholder="Enter class description"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating..." : "Create Class"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
