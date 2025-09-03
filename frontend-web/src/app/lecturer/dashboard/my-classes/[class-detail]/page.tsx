"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Loader2, ClipboardList, Target, Cpu, Package, CalendarPlus, Eye } from "lucide-react"
import { getClassById } from "@/services/classServices"
import { getLabBySubjectId } from "@/services/labServices"
import { Button } from "@/components/ui/button"
import { Pagination } from "antd"
import LabDetail from "@/components/head/lab/LabDetail"
import GroupTab from "@/components/lecturer/group/GroupTab"
import GradeTab from "@/components/lecturer/grade/GradeTab"
import CreateLabBooking from "@/components/lecturer/lab/CreateLabBooking"

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

interface Lab {
    labId: number
    subjectId: number
    labName: string
    labRequest: string
    labTarget: string
    labStatus: string
    requiredEquipments: {
        equipmentTypeId: string
        equipmentTypeName?: string
    }[]
    requiredKits: {
        kitTemplateId: string
        kitTemplateName?: string
    }[]
}

interface Group {
    groupId: number
    groupName: string
}

export default function ClassDetailPage() {
    const searchParams = useSearchParams()
    const classId = searchParams.get("classId")
    const router = useRouter()
    const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
    const [labs, setLabs] = useState<Lab[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingLabs, setLoadingLabs] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [errorLabs, setErrorLabs] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("students")
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(6)
    const [totalItems, setTotalItems] = useState(0)
    const [selectedLabId, setSelectedLabId] = useState<number | null>(null)
    const [openDetail, setOpenDetail] = useState(false)
    const [openBooking, setOpenBooking] = useState(false)

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

    const fetchLabs = useCallback(async () => {
        if (!classDetail?.subjectId) {
            setErrorLabs("No subject ID available")
            setLoadingLabs(false)
            return
        }

        try {
            setLoadingLabs(true)
            setErrorLabs(null)
            const response = await getLabBySubjectId(classDetail.subjectId.toString())
            if (response) {
                const activeLabs = response.pageData.filter((lab: Lab) => lab.labStatus === "Active")
                setLabs(activeLabs)
                setTotalItems(activeLabs.length)
            } else {
                throw new Error(response.message)
            }
        } catch (err: any) {
            const errorMessage = err.message || "Failed to fetch labs"
            setErrorLabs(errorMessage)
            console.error("Error fetching labs:", err)
            setLabs([])
        } finally {
            setLoadingLabs(false)
        }
    }, [classDetail?.subjectId, pageNum, pageSize])

    useEffect(() => {
        if (classDetail?.subjectId) {
            fetchLabs()
        }
    }, [fetchLabs, classDetail])

    const handlePaginationChange = (page: number, pageSize: number | undefined) => {
        setPageNum(page)
        setPageSize(pageSize || 6)
    }

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

    // Map groups to teams format for GradeTab
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
                    <TabsTrigger value="students">Student List</TabsTrigger>
                    <TabsTrigger value="groups">Group List</TabsTrigger>
                    <TabsTrigger value="lab">Lab</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                </TabsList>
                <TabsContent value="lab">
                    <div className="space-y-6">
                        <CardHeader>
                            <div>
                                <CardTitle className="text-2xl font-bold">Class Labs</CardTitle>
                                <CardDescription>Explore all labs available for this class</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingLabs ? (
                                <div className="p-12 text-center text-muted-foreground">
                                    <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto mb-4" />
                                    <p>Loading labs...</p>
                                </div>
                            ) : errorLabs ? (
                                <div className="p-8 text-center text-red-500 font-medium">
                                    <p>{errorLabs}</p>
                                </div>
                            ) : labs.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p>No active labs found for this class.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {labs.map((lab) => (
                                            <Card
                                                key={lab.labId}
                                                className="flex flex-col border shadow-md hover:shadow-xl transition rounded-2xl"
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-semibold">{lab.labName}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-grow space-y-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <ClipboardList className="w-4 h-4 text-blue-500" />
                                                        <span className="flex-1 truncate max-w-[220px]">
                                                            <span className="font-semibold">Request:</span> {lab.labRequest}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-green-500" />
                                                        <span className="flex-1 truncate max-w-[220px]">
                                                            <span className="font-semibold">Target:</span> {lab.labTarget}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Cpu className="w-4 h-4 text-orange-500" />
                                                        <span className="flex-1 truncate max-w-[220px]">
                                                            <span className="font-semibold">Equipments:</span>{" "}
                                                            {lab.requiredEquipments.length > 0
                                                                ? lab.requiredEquipments
                                                                    .map((eq) => eq.equipmentTypeName || eq.equipmentTypeId)
                                                                    .join(", ")
                                                                : "None"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-pink-500" />
                                                        <span className="flex-1 truncate max-w-[220px]">
                                                            <span className="font-semibold">Kits:</span>{" "}
                                                            {lab.requiredKits.length > 0
                                                                ? lab.requiredKits.map((kit) => kit.kitTemplateName || kit.kitTemplateId).join(", ")
                                                                : "None"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-center gap-4 mt-4">
                                                        <Button
                                                            variant="outline"
                                                            className="w-auto px-4 bg-transparent"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedLabId(lab.labId)
                                                                setOpenBooking(true)
                                                            }}
                                                        >
                                                            <CalendarPlus className="w-4 h-4 mr-2 text-red-500" />
                                                            Lab Booking
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="w-auto px-4 bg-transparent"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedLabId(lab.labId)
                                                                setOpenDetail(true)
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2 text-green-500" />
                                                            View Detail
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <LabDetail labId={selectedLabId} open={openDetail} onClose={() => setOpenDetail(false)} />
                                    <CreateLabBooking
                                        labId={selectedLabId}
                                        classId={classDetail.classId}
                                        open={openBooking}
                                        onClose={() => setOpenBooking(false)}
                                    />
                                    <div className="flex justify-center mt-8">
                                        <Pagination
                                            current={pageNum}
                                            pageSize={pageSize}
                                            total={totalItems}
                                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                                            onChange={handlePaginationChange}
                                            showSizeChanger
                                            onShowSizeChange={(current, size) => {
                                                setPageNum(1)
                                                setPageSize(size)
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </div>
                </TabsContent>
                <TabsContent value="students" className="shadow-lg">
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