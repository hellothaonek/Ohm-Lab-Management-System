"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Users, BookOpen, Calendar, Clock, CheckCircle, AlertCircle, Bell, Award, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { getStudentDashboard } from "@/services/studentDashboardServices" // Import hàm API

// Định nghĩa lại interface dữ liệu để có thể có giá trị null
interface StudentDashboardData {
    studentInfo: {
        userId: string
        studentName: string
        studentEmail: string
        totalEnrolledClasses: number
        totalTeams: number
    }
    upcomingSchedules: Array<{
        scheduleId: number
        scheduleDate: string
        scheduleName: string
        className: string
        slotName: string
        slotStartTime: string
        slotEndTime: string
        labName: string
        labTarget: string
        lecturerName: string
        subjectName: string
        daysUntilSchedule: number
    }>
    assignments: Array<{
        gradeId: number
        labId: number
        labName: string
        gradeStatus: string
        gradeScore: number
        submittedDate: string
        gradedDate: string | null
        teamName: string
        subjectName: string
        isOverdue: boolean
        daysUntilDeadline: number
    }>
    gradeSummary: {
        averageScore: number
        totalAssignments: number
        completedAssignments: number
        pendingAssignments: number
        overdueAssignments: number
        completionRate: number
        highestGradeSubject: string
        lowestGradeSubject: string
    }
    recentIncidents: Array<{
        reportId: number
        reportTitle: string
        reportDescription: string
        reportCreateDate: string
        reportStatus: string
        scheduleName: string
        scheduleDate: string
        className: string
        daysSinceIncident: number
    }>
    notifications: {
        unreadNotifications: number
        upcomingDeadlines: number
        pendingActions: number
        newGrades: number
    }
}

export default function StudentDashboardPage() {
    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const apiData: StudentDashboardData = await getStudentDashboard();
                setData(apiData);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const studentInfo = data?.studentInfo || {
        studentName: "Student Name",
        studentEmail: "student@example.com",
        totalEnrolledClasses: 0,
        totalTeams: 0,
    };

    const gradeSummary = data?.gradeSummary || {
        averageScore: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        overdueAssignments: 0,
        completionRate: 0,
        highestGradeSubject: "N/A",
        lowestGradeSubject: "N/A",
    };

    const today = new Date().toISOString().split("T")[0];
    const todaySchedules = (data?.upcomingSchedules || []).filter((schedule) => {
        const scheduleDate = new Date(schedule.scheduleDate).toISOString().split("T")[0];
        return scheduleDate === today;
    });

    const assignments = data?.assignments || [];
    const recentIncidents = data?.recentIncidents || [];
    const notifications = data?.notifications || {
        unreadNotifications: 0,
        upcomingDeadlines: 0,
        pendingActions: 0,
        newGrades: 0,
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="ml-2 text-lg text-gray-600">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="ml-2 text-lg text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lớp học</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentInfo.totalEnrolledClasses}</div>
                        <p className="text-xs text-muted-foreground">Lớp đã đăng ký</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{gradeSummary.averageScore.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            <span
                                className={
                                    gradeSummary.averageScore >= 8
                                        ? "text-green-600"
                                        : gradeSummary.averageScore >= 6.5
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                }
                            >
                                {gradeSummary.averageScore >= 8
                                    ? "Xuất sắc"
                                    : gradeSummary.averageScore >= 6.5
                                        ? "Khá"
                                        : "Cần cải thiện"}
                            </span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bài tập</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {gradeSummary.completedAssignments}/{gradeSummary.totalAssignments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã hoàn thành
                            </span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Thông báo</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notifications.unreadNotifications}</div>
                        <p className="text-xs text-muted-foreground">
                            {notifications.newGrades > 0 && <span className="text-blue-600">{notifications.newGrades} điểm mới</span>}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Lịch học hôm nay</CardTitle>
                        <CardDescription>Các buổi học trong ngày hôm nay</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {todaySchedules.slice(0, 4).map((schedule) => (
                                <div key={schedule.scheduleId} className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {schedule.className} - {schedule.subjectName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {schedule.slotName} ({formatTime(schedule.slotStartTime)} - {formatTime(schedule.slotEndTime)})
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {schedule.lecturerName} • {schedule.labName}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-xs text-muted-foreground">{formatDate(schedule.scheduleDate)}</div>
                                </div>
                            ))}
                            {todaySchedules.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Không có lịch học hôm nay</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bài tập gần đây</CardTitle>
                        <CardDescription>Trạng thái các bài tập đã nộp</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {assignments.slice(0, 4).map((assignment) => (
                                <div key={assignment.gradeId} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {assignment.gradeStatus === "Submitted" && <Clock className="h-4 w-4 text-yellow-500" />}
                                        {assignment.gradeStatus === "Graded" && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        {assignment.isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{assignment.labName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {assignment.subjectName} • {assignment.teamName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge
                                                variant={
                                                    assignment.gradeStatus === "Graded"
                                                        ? "default"
                                                        : assignment.gradeStatus === "Submitted"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                                className="text-xs"
                                            >
                                                {assignment.gradeStatus === "Submitted"
                                                    ? "Đã nộp"
                                                    : assignment.gradeStatus === "Graded"
                                                        ? "Đã chấm"
                                                        : assignment.gradeStatus}
                                            </Badge>
                                            {assignment.gradeStatus === "Graded" && (
                                                <span className="text-xs font-medium">Điểm: {assignment.gradeScore}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {assignments.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Chưa có bài tập nào</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sự cố gần đây</CardTitle>
                    <CardDescription>Các báo cáo sự cố đã được gửi</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentIncidents.map((incident) => (
                            <div key={incident.reportId} className="flex items-start space-x-4 p-4 border rounded-lg">
                                <div className="flex-shrink-0 mt-1">
                                    {incident.reportStatus === "Resolved" ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{incident.reportTitle}</p>
                                        <Badge variant={incident.reportStatus === "Resolved" ? "default" : "secondary"} className="text-xs">
                                            {incident.reportStatus === "Resolved" ? "Đã giải quyết" : "Đang xử lý"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {incident.className} • {incident.scheduleName}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Báo cáo ngày: {formatDate(incident.reportCreateDate)} • {incident.daysSinceIncident} ngày trước
                                    </p>
                                    {incident.reportDescription && (
                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                            {incident.reportDescription.split("\n")[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {recentIncidents.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Không có sự cố nào được báo cáo</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}