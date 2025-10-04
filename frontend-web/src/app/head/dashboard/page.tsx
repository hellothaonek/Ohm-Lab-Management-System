"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Users, Database, AlertTriangle, GraduationCapIcon, File, FileText } from "lucide-react";
import { getDashboard } from "@/services/headDashboardServices";
import { getLecturerPerformance } from "@/services/headDashboardServices";
import { Progress } from "@/components/ui/progress"; // Assuming Shadcn/UI Progress component

interface DashboardData {
  totalClasses: number;
  totalLecturers: number;
  totalSubjects: number;
  totalSchedules: number;
}

interface LecturerPerformance {
  lecturerId: string;
  lecturerName: string;
  totalAssignedClasses: number;
  totalLabSessions: number;
  completedSessions: number;
  completionRate: number;
  subjectsTaught: string[];
}

export default function HeadDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [lecturerPerformance, setLecturerPerformance] = useState<LecturerPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard = await getDashboard();
        setDashboardData(dashboard);

        const performance = await getLecturerPerformance();
        setLecturerPerformance(performance);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard or lecturer performance data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Head of Department dashboard for the Electronics Lab Management System.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalClasses || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalLecturers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalSubjects || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalSchedules || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lecturer Performance</CardTitle>
          <CardDescription>Based on lab sessions and completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lecturerPerformance.map((lecturer, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{lecturer.lecturerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {lecturer.totalLabSessions} sessions, {lecturer.totalAssignedClasses} classes
                  </p>
                </div>
                <div className="w-24">
                  <Progress value={lecturer.completionRate} className="h-2" />
                  <span className="text-xs text-muted-foreground">{lecturer.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}