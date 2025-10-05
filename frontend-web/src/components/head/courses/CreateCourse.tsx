"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSubject } from "@/services/courseServices"
import { getSemesters } from "@/services/semesterServices"

interface CreateCourseProps {
  onSubjectCreated: () => void
}

interface Semester {
  semesterId: string
  semesterName: string
}

export default function CreateCourse({ onSubjectCreated }: CreateCourseProps) {
  const [formData, setFormData] = useState({
    subjectName: "",
    subjectCode: "",
    subjectDescription: "",
    semesterId: ""
  })
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const semesterData = await getSemesters()
        setSemesters(semesterData.pageData)
      } catch (err) {
        setError("Failed to load semesters")
        console.error("Error fetching semesters:", err)
      }
    }
    fetchSemesters()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSemesterChange = (value: string) => {
    setFormData({ ...formData, semesterId: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subjectName || !formData.subjectCode || !formData.subjectDescription || !formData.semesterId) {
      setError("All fields are required")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await createSubject({
        subjectName: formData.subjectName,
        subjectCode: formData.subjectCode,
        subjectDescription: formData.subjectDescription,
        semesterId: formData.semesterId
      })
      setFormData({ subjectName: "", subjectCode: "", subjectDescription: "", semesterId: "" })
      setOpen(false)
      onSubjectCreated()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create subject")
      console.error("Error creating subject:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Find the selected semester to display its name
  const selectedSemester = semesters.find(semester => semester.semesterId === formData.semesterId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600">
          New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="subjectName">Course Name</Label>
            <Input
              id="subjectName"
              name="subjectName"
              value={formData.subjectName}
              onChange={handleChange}
              placeholder="Enter subject name"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectCode">Course Code</Label>
            <Input
              id="subjectCode"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              placeholder="Enter subject code"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectDescription">Description</Label>
            <Textarea
              id="subjectDescription"
              name="subjectDescription"
              value={formData.subjectDescription}
              onChange={handleChange}
              placeholder="Enter subject description"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semesterId">Semester</Label>
            <Select
              name="semesterId"
              value={formData.semesterId}
              onValueChange={handleSemesterChange}
              disabled={isLoading || semesters.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a semester">
                  {selectedSemester ? selectedSemester.semesterName : "Select a semester"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester.semesterId} value={semester.semesterId}>
                    {semester.semesterName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}