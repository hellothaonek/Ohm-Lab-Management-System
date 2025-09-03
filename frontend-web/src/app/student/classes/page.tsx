"use client"

import { useMemo, useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ClassItem = {
  classId: number
  className: string
  classDescription: string
  classStatus: string
  subjectName: string
  classUsers?: any[]
}

const sampleClasses: ClassItem[] = [
  { classId: 1, className: "PRM392-01", classDescription: "Project Management", classStatus: "Valid", subjectName: "PRM392", classUsers: [] },
  { classId: 2, className: "MMA301-02", classDescription: "Math for AI", classStatus: "Valid", subjectName: "MMA301", classUsers: [] },
]

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setClasses(sampleClasses)
  }, [])

  const filtered = useMemo(() => {
    return classes.filter((c) =>
      c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.classDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [classes, searchTerm])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Valid":
        return "default"
      case "Invalid":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
            <p className="text-muted-foreground">Classes you are enrolled in</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by class name, subject or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((classItem) => (
                  <TableRow key={classItem.classId}>
                    <TableCell className="font-medium">{classItem.className}</TableCell>
                    <TableCell>{classItem.subjectName || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">{classItem.classDescription}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(classItem.classStatus)}>{classItem.classStatus}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  )
}


