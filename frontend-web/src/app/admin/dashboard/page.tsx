"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Users,
    Database,
    AlertTriangle,
    Activity,
    TrendingUp,
    TrendingDown,
    Settings,
    FileText, // Added for totalReports icon
} from "lucide-react"
import Link from "next/link"
import LabUsageReport from "@/components/admin/dashboard/LabUsageReport"
import { searchUsers } from "@/services/userServices"
import { getReportStatistics } from "@/services/reportServices"

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 142,
        totalEquipment: 89,
        maintenanceAlerts: 7,
        systemUptime: "99.8%",
        storageUsed: "67%",
        totalReports: 0, // Initialize totalReports
    })
    const [isLoading, setIsLoading] = useState(true) // Added for loading state

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                // Fetch totalUsers
                const userResponse = await searchUsers({
                    keyWord: "",
                    role: "",
                    status: "",
                    pageNum: 1,
                    pageSize: 10,
                })
                const reportResponse = await getReportStatistics()

                setStats((prev) => ({
                    ...prev,
                    totalUsers: userResponse.pageInfo.totalItem,
                    totalReports: reportResponse.totalReports, 
                }))
            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const recentActivities = [
        {
            id: 1,
            user: "Dr. Nguyen Van A",
            action: "Created new class",
            time: "2 minutes ago",
            type: "create",
        },
        {
            id: 2,
            user: "Lecturer Tran Thi B",
            action: "Updated equipment status",
            time: "15 minutes ago",
            type: "update",
        },
        {
            id: 3,
            user: "System",
            action: "Backup completed successfully",
            time: "1 hour ago",
            type: "system",
        },
        {
            id: 4,
            user: "Dr. Le Van C",
            action: "Submitted maintenance request",
            time: "2 hours ago",
            type: "maintenance",
        },
    ]

    const systemAlerts = [
        {
            id: 1,
            message: "Server disk usage is above 80%",
            severity: "warning",
            time: "30 minutes ago",
        },
        {
            id: 2,
            message: "Equipment #EQ-001 requires maintenance",
            severity: "error",
            time: "1 hour ago",
        },
        {
            id: 3,
            message: "New user registration pending approval",
            severity: "info",
            time: "2 hours ago",
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">System overview and management tools</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-2xl font-bold">Loading...</div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-green-600 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        +12% from last month
                                    </span>
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +8% from last week
                            </span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Equipment</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEquipment}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-600 flex items-center">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                -2 from maintenance
                            </span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" /> {/* Icon for totalReports */}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-2xl font-bold">Loading...</div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalReports}</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-green-600 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        Updated October 2025
                                    </span>
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <LabUsageReport />
            </div>
        </div>
    )
}