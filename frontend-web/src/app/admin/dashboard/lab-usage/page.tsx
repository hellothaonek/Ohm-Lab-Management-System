"use client"

import { useState, useEffect } from "react"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Activity, BookOpen, Clock, TrendingUp, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LineChart,
    Line,
    ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { getLabUsageBySemester } from "@/services/analyticsServices"
import { getSemesters } from "@/services/semesterServices"

interface LabUsageData {
    startDate: string
    endDate: string
    totalSessions: number
    totalClasses: number
    totalSubjects: number
    subjectUsage: {
        subjectId: number
        subjectName: string
        sessionCount: number
        classCount: number
        usagePercentage: number
        lecturerNames: string[]
    }[]
    slotUsage: {
        slotId: number
        slotName: string
        startTime: string
        endTime: string
        sessionCount: number
        usagePercentage: number
        popularSubjects: string[]
    }[]
    lecturerUsage: {
        lecturerId: string
        lecturerName: string
        lecturerEmail: string
        sessionCount: number
        classCount: number
        subjectsTaught: string[]
        activityScore: number
    }[]
    dailyUsage: {
        date: string
        sessionCount: number
    }[]
}

interface DailyUsageData {
    date: string
    sessions: number
}

interface Semester {
    semesterId: number
    semesterName: string
    semesterStartDate: string
    semesterEndDate: string
    semesterDescription: string
    semesterStatus: string
}

const COLORS = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Orange
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#f97316", // Orange-red
    "#84cc16", // Lime
]

export default function LabReportsPage() {
    const [timePeriod, setTimePeriod] = useState<"week" | "month">("week")
    const [semester, setSemester] = useState<string>("") // Initialize as empty string
    const [semesters, setSemesters] = useState<Semester[]>([]) // State for semesters
    const [labUsageData, setLabUsageData] = useState<LabUsageData | null>(null)
    const [dailyUsageData, setDailyUsageData] = useState<DailyUsageData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const response = await getSemesters()
                const semestersData = response.pageData
                setSemesters(semestersData)
                // Set the default semester to the first one in the list
                if (semestersData.length > 0) {
                    setSemester(semestersData[0].semesterId.toString())
                }
            } catch (err) {
                setError("Failed to fetch semesters")
                console.error(err)
            }
        }

        fetchSemesters()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            if (!semester) return // Skip if no semester is selected
            try {
                setLoading(true)
                const response = await getLabUsageBySemester(semester)

                const generateDateRange = (startDate: string, endDate: string): string[] => {
                    const dates: string[] = []
                    const start = new Date(startDate)
                    const end = new Date(endDate)
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        dates.push(
                            d
                                .toLocaleDateString("en-US", {
                                    month: "2-digit",
                                    day: "2-digit",
                                })
                                .replace(/\//g, "/"),
                        )
                    }
                    return dates
                }

                const mapDailyUsage = (
                    apiDailyUsage: { date: string; sessionCount: number }[],
                    startDate: string,
                    endDate: string,
                ): DailyUsageData[] => {
                    const dateMap = new Map<string, number>()
                    apiDailyUsage.forEach((item) => {
                        const formattedDate = new Date(item.date)
                            .toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                            })
                            .replace(/\//g, "/")
                        dateMap.set(formattedDate, item.sessionCount)
                    })

                    const allDates = generateDateRange(startDate, endDate)
                    return allDates.map((date) => ({
                        date,
                        sessions: dateMap.get(date) || 0,
                    }))
                }

                setLabUsageData(response)
                setDailyUsageData(mapDailyUsage(response.dailyUsage, response.startDate, response.endDate))
            } catch (err) {
                setError("Failed to fetch lab usage data")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [semester])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error || !labUsageData) {
        return <div>{error || "No data available"}</div>
    }

    return (
        <div>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-5">
                            <Activity className="h-5 w-5" />
                            Lab Usage Statistics
                        </CardTitle>
                        <CardDescription>
                            Period: {new Date(labUsageData.startDate).toLocaleDateString()} -{" "}
                            {new Date(labUsageData.endDate).toLocaleDateString()}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={semester} onValueChange={setSemester}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map((sem) => (
                                    <SelectItem key={sem.semesterId} value={sem.semesterId.toString()}>
                                        {sem.semesterName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={timePeriod} onValueChange={(value: "week" | "month") => setTimePeriod(value)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            {/* Summary Statistics */}
            <CardContent className="space-y-8">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{labUsageData.totalSessions}</div>
                        <div className="text-xs text-muted-foreground">Total Sessions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{labUsageData.totalClasses}</div>
                        <div className="text-xs text-muted-foreground">Classes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{labUsageData.totalSubjects}</div>
                        <div className="text-xs text-muted-foreground">Subjects</div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Subject Usage Distribution
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={labUsageData.subjectUsage}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ subjectName, usagePercentage }) => `${subjectName}: ${usagePercentage.toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="usagePercentage"
                                    >
                                        {labUsageData.subjectUsage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time Slot Sessions
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={labUsageData.slotUsage}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="slotName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sessionCount">
                                        {labUsageData.slotUsage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Lecturer Activity
                        </h4>
                        <div className="space-y-3">
                            {labUsageData.lecturerUsage.map((lecturer) => (
                                <div key={lecturer.lecturerId} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium">{lecturer.lecturerName}</div>
                                        <Badge variant={lecturer.activityScore >= 60 ? "default" : "secondary"}>
                                            {lecturer.activityScore}%
                                        </Badge>
                                    </div>
                                    <Progress value={lecturer.activityScore} className="mb-2" />
                                    <div className="text-sm text-muted-foreground">
                                        {lecturer.sessionCount} sessions • {lecturer.classCount} classes
                                    </div>
                                    <div className="text-xs text-muted-foreground">{lecturer.subjectsTaught.join(", ")}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Daily Usage
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyUsageData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="sessions"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                                        connectNulls={true}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </CardContent>
        </div>
    )
}