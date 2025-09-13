"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronLeft, Loader2 } from "lucide-react"
import { getClassById } from "@/services/classServices"
import { Button } from "@/components/ui/button"
import GradeTab from "@/components/lecturer/grade/GradeTab"
import GroupTab from "@/components/student/group/GroupTab"
import LabTab from "@/components/student/lab/LabTab"

interface ClassDetail {
    classId: number
    className: string
    subjectId: number
    classUsers: {
        classUserId: number
        userName: string
        userEmail: string
        userNumberCode: string
    }[]
}

interface Group {
    groupId: number
    groupName: string
}

export default function StudentClassDetailPage() {
    const searchParams = useSearchParams()
    const classId = searchParams.get("classId")
    const router = useRouter()
    const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("groups")

    useEffect(() => {
        const fetchClassDetail = async () => {
            try {
                setLoading(true)
                if (classId) {
                    const data = await getClassById(classId)
                    setClassDetail({
                        classId: data.classId,
                        className: data.className,
                        subjectId: data.subjectId,
                        classUsers: data.classUsers.map((user: any) => ({
                            classUserId: user.classUserId,
                            userName: user.userName,
                            userEmail: user.userEmail,
                            userNumberCode: user.userNumberCode,
                        })),
                    })
                }
            } catch (err) {
                setError("Failed to fetch class details")
            } finally {
                setLoading(false)
            }
        }

        const fetchGroups = async () => {
            try {
                // Replace with actual group fetching logic, e.g., getGroupsByClassId(classId)
                setGroups([])
            } catch (err) {
                console.error("Error fetching groups:", err)
            }
        }

        if (classId) {
            fetchClassDetail()
            fetchGroups()
        }
    }, [classId])

    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <Card>
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !classDetail) {
        return (
            <div className="min-h-screen p-4">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{error || "Class not found"}</h3>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const teams = groups.map(group => ({
        teamId: group.groupId,
        teamName: group.groupName,
    }))

    return (
        <div className="min-h-screen p-4">
            <div className="mb-6">
                <Button onClick={() => router.back()} variant="outline" className="mb-4 rounded-full w-10 h-10">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>
            <h2 className="text-3xl text-gray-900 dark:text-white mb-6">Details of class {classDetail.className}</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="groups">Group List</TabsTrigger>
                    <TabsTrigger value="lab">Lab</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                </TabsList>
                <TabsContent value="lab">
                    <LabTab classId={classId || ""} />
                </TabsContent>
                <TabsContent value="groups" className="shadow-lg">
                    <GroupTab classId={classId || ""} />
                </TabsContent>
                <TabsContent value="grades" className="shadow-lg">
                    <GradeTab classId={classId || ""} />
                </TabsContent>
            </Tabs>
        </div>
    )
}