"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { updateClass, getClassById } from "@/services/classServices"
import { getSubjects } from "@/services/courseServices"
import { getAllScheduleTypes } from "@/services/scheduleTypeServices"
import { searchUsers } from "@/services/userServices"

interface EditClassProps {
    classItem: {
        classId: number
        subjectId: number
        lecturerId: number | null
        scheduleTypeId: number | null
        className: string
        classDescription: string
        classStatus: string
    }
    onUpdate: (updatedClass: any) => void
    onClose: () => void
    open: boolean
}

interface ClassItem {
    classId: number
    subjectId: number
    lecturerId: number | null
    scheduleTypeId: number | null
    className: string
    classDescription: string
    classStatus: string
    subjectName: string
    lecturerName: string | null
    classUsers: any[]
    scheduleTypeDow?: string
    slotStartTime?: string
    slotEndTime?: string
}

interface Subject {
    subjectId: number
    subjectName: string
}

interface User {
    userId: number
    userFullName: string
    userRoleName?: string
}

interface ScheduleType {
    scheduleTypeId: number
    scheduleTypeName: string // Added scheduleTypeName
    scheduleTypeDow: string
    slotStartTime: string
    slotEndTime: string
}

export default function EditClass({ classItem, onUpdate, onClose, open }: EditClassProps) {
    const [formData, setFormData] = useState({
        subjectId: classItem.subjectId.toString(),
        lecturerId: classItem.lecturerId?.toString() || "none",
        scheduleTypeId: classItem.scheduleTypeId ? classItem.scheduleTypeId.toString() : "none",
        className: classItem.className,
        classDescription: classItem.classDescription,
        classStatus: classItem.classStatus,
    })
    const [classData, setClassData] = useState<ClassItem | null>(null)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [lecturers, setLecturers] = useState<User[]>([])
    const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!open) return;
            try {
                setLoading(true)
                const [classResponse, subjectsResponse, lecturersResponse, scheduleTypesRes] = await Promise.all([
                    getClassById(classItem.classId.toString()),
                    getSubjects(),
                    searchUsers(
                        { keyWord: "", role: "Lecturer", status: "", pageNum: 1, pageSize: 100 },
                    ),
                    getAllScheduleTypes(),
                ])
                setClassData(classResponse)
                setSubjects(subjectsResponse.pageData || [])
                setLecturers(lecturersResponse.pageData || [])
                setScheduleTypes(scheduleTypesRes || [])
                setFormData({
                    subjectId: classResponse.subjectId.toString(),
                    lecturerId: classResponse.lecturerId?.toString() || "none",
                    scheduleTypeId: classResponse.scheduleTypeId ? classResponse.scheduleTypeId.toString() : "none",
                    className: classResponse.className,
                    classDescription: classResponse.classDescription,
                    classStatus: classResponse.classStatus,
                })
            } catch (err) {
                setError("Failed to fetch class data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [classItem.classId, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const updatedClass = await updateClass(classItem.classId.toString(), {
                ...formData,
                subjectId: parseInt(formData.subjectId),
                lecturerId: formData.lecturerId === "none" ? "" : formData.lecturerId,
                scheduleTypeId: formData.scheduleTypeId === "none" ? 0 : parseInt(formData.scheduleTypeId),
            })
            const subject = subjects.find(s => s.subjectId.toString() === formData.subjectId)
            const lecturer = lecturers.find(l => l.userId.toString() === formData.lecturerId)
            const schedule = scheduleTypes.find(s => s.scheduleTypeId.toString() === formData.scheduleTypeId)

            onUpdate({
                ...updatedClass,
                subjectName: subject?.subjectName || "-",
                lecturerName: lecturer?.userFullName || "-",
                scheduleTypeDow: schedule?.scheduleTypeDow || "-",
                slotStartTime: schedule?.slotStartTime || "-",
                slotEndTime: schedule?.slotEndTime || "-",
            })
            onClose()
        } catch (err) {
            setError("Failed to update class")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="className">Class Name</Label>
                            <Input
                                id="className"
                                value={formData.className}
                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="subjectId">Subject</Label>
                            <Select
                                value={formData.subjectId}
                                onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.length > 0 ? (
                                        subjects.map((subject) => (
                                            <SelectItem
                                                key={`subject-${subject.subjectId}`}
                                                value={subject.subjectId.toString()}
                                            >
                                                {subject.subjectName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem key="no-subjects" value="none" disabled>
                                            No subjects available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lecturerId">Lecturer</Label>
                            <Select
                                value={formData.lecturerId}
                                onValueChange={(value) => setFormData({ ...formData, lecturerId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select lecturer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem key="lecturer-none" value="none">
                                        None
                                    </SelectItem>
                                    {lecturers.length > 0 ? (
                                        lecturers.map((lecturer) => (
                                            <SelectItem
                                                key={`lecturer-${lecturer.userId}`}
                                                value={lecturer.userId.toString()}
                                            >
                                                {lecturer.userFullName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem key="no-lecturers" value="no-lecturers" disabled>
                                            No lecturers available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="scheduleTypeId">Schedule</Label>
                            <Select
                                value={formData.scheduleTypeId}
                                onValueChange={(value) => setFormData({ ...formData, scheduleTypeId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select schedule" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem key="schedule-none" value="none">
                                        None
                                    </SelectItem>
                                    {scheduleTypes.length > 0 ? (
                                        scheduleTypes.map((schedule) => (
                                            <SelectItem
                                                key={`schedule-${schedule.scheduleTypeId}`}
                                                value={schedule.scheduleTypeId.toString()}
                                            >
                                                {`${schedule.scheduleTypeDow}, ${schedule.slotStartTime} - ${schedule.slotEndTime}`}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem key="no-schedules" value="no-schedules" disabled>
                                            No schedules available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="classDescription">Description</Label>
                            <Input
                                id="classDescription"
                                value={formData.classDescription}
                                onChange={(e) => setFormData({ ...formData, classDescription: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="classStatus">Status</Label>
                            <Select
                                value={formData.classStatus}
                                onValueChange={(value) => setFormData({ ...formData, classStatus: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="Inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Class"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}