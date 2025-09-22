"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createClass } from "@/services/classServices"
import { getSubjects } from "@/services/courseServices"
import { searchUsers } from "@/services/userServices"

interface ClassItem {
    classId: number
    subjectId: number
    lecturerId: number | null
    scheduleTypeId: number | null
    semesterName: string
    className: string
    classDescription: string
    classStatus: string
    subjectName: string
    lecturerName: string | null
    classUsers: any[]
}

interface Subject {
    subjectId: number
    subjectName: string
}

interface User {
    userId: number
    userFullName: string
}

interface CreateNewClassProps {
    onCreateClass: (newClass: ClassItem) => void
}

export default function CreateNewClass({ onCreateClass }: CreateNewClassProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        subjectId: "",
        lecturerId: "",
        className: "",
        classDescription: "",
    })
    const [status, setStatus] = useState("active")
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [subjectsLoading, setSubjectsLoading] = useState(true)
    const [subjectsError, setSubjectsError] = useState<string | null>(null)
    const [lecturers, setLecturers] = useState<User[]>([])
    const [lecturersLoading, setLecturersLoading] = useState(true)
    const [lecturersError, setLecturersError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setSubjectsLoading(true)
                const response = await getSubjects()
                if (response) {
                    setSubjects(response.pageData)
                } else {
                    throw new Error("Invalid subjects data format")
                }
            } catch (error) {
                setSubjectsError("Failed to fetch subjects")
                toast({
                    title: "Error",
                    description: "Failed to load subjects",
                    variant: "destructive",
                })
            } finally {
                setSubjectsLoading(false)
            }
        }

        const fetchLecturers = async () => {
            try {
                setLecturersLoading(true)
                const response = await searchUsers(
                    { keyWord: "", role: "Lecturer", status: "", pageNum: 1, pageSize: 100 },
                )
                if (response) {
                    setLecturers(response.pageData)
                } else {
                    throw new Error("Invalid lecturers data format")
                }
            } catch (error) {
                setLecturersError("Failed to fetch lecturers")
                toast({
                    title: "Error",
                    description: "Failed to load lecturers",
                    variant: "destructive",
                })
            } finally {
                setLecturersLoading(false)
            }
        }

        fetchSubjects()
        fetchLecturers()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form data
        // No change needed here, this is a good practice for form submission
        if (!formData.subjectId || !formData.lecturerId || !formData.className || !status) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        // Prepare data for API
        const classData = {
            subjectId: parseInt(formData.subjectId),
            lecturerId: formData.lecturerId || "",
            scheduleTypeId: 0, // Set scheduleTypeId to 0 as per requirement
            className: formData.className,
            classDescription: formData.classDescription,
            classStatus: status,
        }

        try {
            const response = await createClass(classData)
            const selectedSubject = subjects.find((subject) => subject.subjectId === parseInt(formData.subjectId))
            const selectedLecturer = lecturers.find((lecturer) => lecturer.userId === parseInt(formData.lecturerId))
            const newClass: ClassItem = {
                ...response,
                subjectName: selectedSubject ? selectedSubject.subjectName : `Subject ${formData.subjectId}`,
                lecturerName: selectedLecturer ? selectedLecturer.userFullName : null,
            }
            onCreateClass(newClass)
            setIsOpen(false)
            toast({
                title: "Success",
                description: "New class created successfully",
            })

            // Reset form
            setFormData({
                subjectId: "",
                lecturerId: "",
                className: "",
                classDescription: "",
            })
            setStatus("active")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create class",
                variant: "destructive",
            })
        }
    }

    // Check if the form is valid to enable the button
    const isFormValid = formData.subjectId !== "" && formData.lecturerId !== "" && formData.className.trim() !== ""

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                    New Class
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                {subjectsError || lecturersError ? (
                    <div className="text-red-600 text-center">
                        {subjectsError || lecturersError}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subjectId">Subject</Label>
                                <Select
                                    value={formData.subjectId}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subjectId: value }))}
                                    disabled={subjectsLoading || !subjects.length}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                subjectsLoading
                                                    ? "Loading subjects..."
                                                    : subjects.length
                                                        ? "Select a subject"
                                                        : "No subjects available"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(subjects) &&
                                            subjects.map((subject) => (
                                                <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                                                    {subject.subjectName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lecturerId">Lecturer</Label>
                                <Select
                                    value={formData.lecturerId}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, lecturerId: value }))}
                                    disabled={lecturersLoading || !lecturers.length}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                lecturersLoading
                                                    ? "Loading lecturers..."
                                                    : lecturers.length
                                                        ? "Select a lecturer"
                                                        : "No lecturers available"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(lecturers) &&
                                            lecturers.map((lecturer) => (
                                                <SelectItem key={lecturer.userId} value={lecturer.userId.toString()}>
                                                    {lecturer.userFullName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="className">Class Name</Label>
                                <Input
                                    id="className"
                                    name="className"
                                    value={formData.className}
                                    onChange={handleInputChange}
                                    placeholder="e.g., SE1925.01"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="classDescription">Class Description</Label>
                            <Input
                                id="classDescription"
                                name="classDescription"
                                value={formData.classDescription}
                                onChange={handleInputChange}
                                placeholder="Enter class description"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-orange-500 hover:bg-orange-600"
                                disabled={subjectsLoading || lecturersLoading || !!subjectsError || !!lecturersError || !isFormValid}
                            >
                                Create 
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}