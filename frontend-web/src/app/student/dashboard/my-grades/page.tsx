"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, User, Loader2, AlertTriangle, Users, BookOpen, Clock, BarChart3, MessageSquare, Briefcase } from "lucide-react"

import { useAuth } from '@/context/AuthContext'
import { getStudentGradeLabs } from '@/services/gradeServices'

// Reusing the Grade and StudentGradeData interfaces
interface Grade {
    gradeId: number;
    labId: number;
    labName: string;
    labTarget: string;
    subjectName: string;
    className: string;
    teamId: number | null;
    teamName: string;
    gradeScore: number | null;
    gradeDescription: string;
    gradeStatus: string;
    isTeamGrade: boolean;
    hasIndividualGrade: boolean;
    lecturerName: string;
}

interface StudentGradeData {
    studentId: string;
    studentName: string;
    studentEmail: string;
    labGrades: Grade[];
    teamId: number | null;
    teamName: string;
}

// Component to display grade details in a Card
const GradeDetailCard = ({ grade, index }: { grade: Grade, index: number }) => {
    const isFailed = grade.gradeScore !== null && grade.gradeScore < 5.0;

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'graded':
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">{status}</Badge>;
            case 'submitted':
                return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">{status}</Badge>;
            case 'chưa nộp':
                return <Badge variant="secondary" className="bg-gray-400 hover:bg-gray-500 text-white">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary ml-0">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        {grade.subjectName} - {grade.className}
                        <span className="ml-2">{getStatusBadge(grade.gradeStatus)}</span>
                    </CardTitle>
                </div>
                <div className="flex flex-col items-end">
                    {/* Display score */}
                    <div className={`text-2xl font-bold ${isFailed ? "text-red-600" : "text-green-600"}`}>
                        {grade.gradeScore !== null ? grade.gradeScore.toFixed(1) : '-'}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="col-span-2">
                        <div className="flex items-center text-sm text-gray-700">
                            <span className="font-semibold">Lab:</span> {grade.labName}
                        </div>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <span className="font-semibold">Lecturer:</span> {grade.lecturerName}
                    </div>
                    <div className="col-span-2">
                        <div className="flex items-start text-gray-700">
                            <span className="font-semibold">Feedback:</span> {grade.gradeDescription || "Không có mô tả."}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function StudentGradePage() {
    const { user } = useAuth();
    const [gradeData, setGradeData] = useState<StudentGradeData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const userId = user?.userId
        if (!userId) {
            setError("Authentication error: Student ID not found.");
            setIsLoading(false);
            return;
        }

        const fetchGrades = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getStudentGradeLabs(userId);
                // console.log("Fetched grade data:", response);
                setGradeData(response);
            } catch (err) {
                console.error("Failed to fetch student grades:", err);
                setError("Failed to load grades. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGrades();
    }, [user]);

    if (!user) {
        return (
            <div className="text-center p-8 space-y-3">
                <AlertTriangle className="h-10 w-10 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold">Lỗi xác thực</h2>
                <p className="text-muted-foreground">Không tìm thấy ID sinh viên. Vui lòng đăng nhập lại.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center p-8 space-y-3">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground">Đang tải dữ liệu điểm...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 space-y-3">
                <AlertTriangle className="h-10 w-10 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold">Lỗi tải dữ liệu</h2>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (!gradeData || !gradeData.labGrades || gradeData.labGrades.length === 0) {
        return (
            <div className="text-center p-8 space-y-3">
                <GraduationCap className="h-10 w-10 mx-auto mb-2 text-primary" />
                <h2 className="text-xl font-semibold">Không có dữ liệu điểm</h2>
                <p className="text-muted-foreground">Hiện tại không có bài lab nào được ghi nhận.</p>
            </div>
        );
    }

    const { studentId, studentName, studentEmail, labGrades, teamName } = gradeData;
    const totalLabs = labGrades.length;
    const completedLabs = labGrades.filter(g => g.gradeScore !== null).length;

    return (
        <div className="w-full max-w-4xl mx-0 pl-0 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>
            <div className="space-y-4">
                {labGrades.map((grade, index) => (
                    <GradeDetailCard
                        key={grade.labId}
                        grade={grade}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}