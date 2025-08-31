"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Loader2 } from "lucide-react"
import { getClassById } from "@/services/classServices"
import { Button } from "@/components/ui/button"

interface ClassDetail {
    classId: number
    className: string
    classUsers: {
        classUserId: number
        userName: string
        userEmail: string
        userNumberCode: string
    }[]
}

export default function ClassDetailPage() {
    const searchParams = useSearchParams()
    const classId = searchParams.get("classId")
    const router = useRouter()
    const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchClassDetail = async () => {
            try {
                setLoading(true)
                if (classId) {
                    const data = await getClassById(classId)
                    setClassDetail({
                        classId: data.classId,
                        className: data.className,
                        classUsers: data.classUsers.map((user: any) => ({
                            classUserId: user.classUserId,
                            userName: user.userName,
                            userEmail: user.userEmail,
                            userNumberCode: user.userNumberCode
                        }))
                    })
                }
            } catch (err) {
                setError("Failed to fetch class details")
            } finally {
                setLoading(false)
            }
        }

        if (classId) {
            fetchClassDetail()
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

    return (
        <div className="min-h-screen p-4">
            <div className="mb-6">
                <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>
            <h2 className="text-3xl text-gray-900 dark:text-white mb-6"> Student list of class {classDetail.className}</h2>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-blue-200">
                            <TableRow>
                                <TableHead className="text-black font-bold">STT</TableHead>
                                <TableHead className="text-black font-bold">Student Code</TableHead>
                                <TableHead className="text-black font-bold">Name</TableHead>
                                <TableHead className="text-black font-bold">Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classDetail.classUsers.map((user, index) => (
                                <TableRow key={user.classUserId}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{user.userNumberCode}</TableCell>
                                    <TableCell>{user.userName}</TableCell>
                                    <TableCell>{user.userEmail}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}