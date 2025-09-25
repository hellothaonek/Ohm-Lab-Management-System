"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { addDays, startOfWeek, format, eachWeekOfInterval } from "date-fns";
import { getCurrentUser } from "@/services/userServices";
import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleSkeleton } from "@/components/loading-skeleton";
import { getScheduleByStudentId } from "@/services/scheduleServices";
import { getRegistrationScheduleByStudentId } from "@/services/registrationScheduleServices";
import { useAuth } from "@/context/AuthContext";

const slots = [
    "7:00 - 9:15",
    "9:30 - 11:45",
    "12:30 - 14:45",
    "15:00 - 17:15",
    "17:30 - 19:45",
    "20:00 - 22:15",
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ScheduleItem {
    scheduleDate: string;
    subjectName: string;
    className: string;
    lecturerName: string;
    slotId: number;
    slotStartTime: string;
    slotEndTime: string;
}

interface LabScheduleItem {
    registrationScheduleId: number;
    registrationScheduleName: string;
    teacherId: string;
    teacherName: string;
    teacherRollNumber: string;
    classId: number;
    className: string;
    labId: number;
    labName: string;
    slotId: number;
    slotName: string;
    slotStartTime: string;
    slotEndTime: string;
    registrationScheduleDate: string;
    registrationScheduleCreateDate: string;
    registrationScheduleDescription: string;
    registrationScheduleNote: string;
    registrationScheduleStatus: string;
}

export default function StudentSchedule() {
    const { user } = useAuth()
    const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [weeks, setWeeks] = useState<{ value: string; label: string }[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [labSchedule, setLabSchedule] = useState<LabScheduleItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                const studentId = user?.userId;
                if (studentId) {
                    const [scheduleData, labScheduleData] = await Promise.all([
                        getScheduleByStudentId(studentId),
                        getRegistrationScheduleByStudentId(studentId),
                    ]);
                    setSchedule(scheduleData);
                    setLabSchedule(labScheduleData);
                } else {
                    setError("Could not retrieve student ID.");
                }
            } catch (err) {
                setError("Failed to fetch schedules. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    const { weekDates, weekOptions } = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);
        const weekStarts = eachWeekOfInterval({ start: startOfYear, end: endOfYear }, { weekStartsOn: 1 });

        const weekOptions = weekStarts.map((weekStart) => ({
            value: format(weekStart, "yyyy-MM-dd"),
            label: `${format(weekStart, "dd/MM")} - ${format(addDays(weekStart, 6), "dd/MM/yyyy")}`,
        })).sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime());

        const dates = Array.from({ length: 7 }).map((_, i) =>
            format(addDays(selectedWeekStart, i), "yyyy-MM-dd")
        );

        return { weekDates: dates, weekOptions };
    }, [selectedWeekStart]);

    const handleWeekChange = (value: string) => {
        setSelectedWeekStart(new Date(value));
    };

    const renderCell = (day: string, slotIndex: number) => {
        const date = weekDates[days.indexOf(day)];
        const lesson = schedule.find((l) =>
            format(new Date(l.scheduleDate), "yyyy-MM-dd") === date && l.slotId === slotIndex + 1
        );
        const labLesson = labSchedule.find((l) =>
            format(new Date(l.registrationScheduleDate), "yyyy-MM-dd") === date && l.slotId === slotIndex + 1
        );

        if (lesson) {
            return (
                <Card className="bg-blue-100 h-full">
                    <CardContent className="p-2 text-sm">
                        <div className="font-bold">{lesson.subjectName}</div>
                        <div className="text-orange-500">{lesson.className}</div>
                        <div className="text-muted-foreground">Lec: {lesson.lecturerName}</div>
                    </CardContent>
                </Card>
            );
        } else if (labLesson) {
            return (
                <Card className="bg-orange-100 h-full">
                    <CardContent className="p-2 text-sm">
                        <div className="text-muted-foreground truncate">{labLesson.labName}</div>
                        <div className="text-orange-500">{labLesson.className}</div>
                        <div className="text-muted-foreground">Lec: {labLesson.teacherName}</div>
                    </CardContent>
                </Card>
            );
        } else {
            return <div className="border p-2 min-h-[80px]" />;
        }
    };

    if (loading) return <ScheduleSkeleton />;

    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
                <Select onValueChange={handleWeekChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={format(selectedWeekStart, "dd/MM/yyyy")} />
                    </SelectTrigger>
                    <SelectContent>
                        {weekOptions.map((week) => (
                            <SelectItem key={week.value} value={week.value}>
                                {week.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-8 gap-px border rounded overflow-hidden text-center text-sm">
                <div className="bg-gray-100 font-bold p-2">Slot</div>
                {days.map((d, index) => (
                    <div key={d} className="bg-gray-100 font-bold p-2">
                        <div>{d}</div>
                        <div className="text-xs text-muted-foreground">
                            {weekDates[index] ? format(new Date(weekDates[index]), "dd/MM") : ""}
                        </div>
                    </div>
                ))}

                {slots.map((time, slotIdx) => (
                    <div key={`slot-${slotIdx}`} className="contents">
                        <div className="bg-gray-100 p-2 min-h-[80px] flex items-center justify-center">{time}</div>
                        {days.map((d) => (
                            <div key={`${d}-${slotIdx}`} className="min-h-[80px]">
                                {renderCell(d, slotIdx)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}