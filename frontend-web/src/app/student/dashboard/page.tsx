"use client"

import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Users, BookOpen, Award, FileText, Bell } from "lucide-react"
import { useContext } from "react"

export default function StudentDashboardPage() {
    // Get userName from AuthContext
    const { user } = useAuth()
    const studentName = user?.userFullName || "Student" 
    return (
        <div className="space-y-6 p-6">
            {/* Welcome Message */}
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
                Welcome, {studentName}!
            </h1>

            {/* FPT University Image */}
            <div className="flex justify-center">
                <img
                    src="/FPTU.jpg"
                    alt="FPT University Campus"
                    className="w-full max-w-2xl h-auto shadow-md"
                />
            </div>
        </div>
    );
}