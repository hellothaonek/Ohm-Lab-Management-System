"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, startOfWeek, format, eachWeekOfInterval } from "date-fns";
import { getCurrentUser } from "@/services/userServices";
import { ScheduleSkeleton } from "@/components/loading-skeleton";
import { getScheduleByLectureId } from "@/services/scheduleServices";
import { listRegistrationScheduleByTeacherId } from "@/services/registrationScheduleServices";
import LabBookingTab from "@/components/lecturer/schedule/LabBookingTab";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

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
    slotId: number;
    slotStartTime: string;
    slotEndTime: string;
}

interface LabBookingItem {
    registrationScheduleDate: string;
    registrationScheduleName: string;
    className: string;
    labName: string; // Add this property if it's in the data
    slotId: number;
    slotStartTime: string;
    slotEndTime: string;
}

export default function LecturerSchedule() {
    const { user } = useAuth()
    const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [labBookings, setLabBookings] = useState<LabBookingItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllSchedules = async () => {
            const userId = user?.userId
            if (!userId) {
                setLoading(false)
                toast.error("User ID not found. Please log in again.")
                return
            }
            try {
                setLoading(true);
                const user = await getCurrentUser();
                const lecturerId = user.userId;
                if (lecturerId) {
                    const [scheduleData, labBookingResponse] = await Promise.all([
                        getScheduleByLectureId(lecturerId),
                        listRegistrationScheduleByTeacherId(lecturerId),
                    ]);

                    setSchedule(scheduleData);

                    // Nâng cao khả năng xử lý lỗi: kiểm tra dữ liệu trước khi set state
                    if (labBookingResponse) {
                        const acceptedBookings = labBookingResponse.filter(
                            (booking: any) => booking.registrationScheduleStatus === "Accept"
                        );
                        setLabBookings(acceptedBookings);
                    } else {
                        // Nếu không có dữ liệu hoặc dữ liệu không đúng định dạng, set state về mảng rỗng
                        setLabBookings([]);
                    }
                } else {
                    setError("Could not retrieve lecturer ID.");
                }
            } catch (err) {
                setError("Failed to fetch schedule. Please try again later.");
                console.error(err);
                // Đảm bảo state không bị undefined khi có lỗi
                setSchedule([]);
                setLabBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllSchedules();
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

        // Find a teaching lesson for this slot
        const lesson = schedule.find((l) =>
            format(new Date(l.scheduleDate), "yyyy-MM-dd") === date && l.slotId === slotIndex + 1
        );

        const booking = labBookings.find((b) =>
            format(new Date(b.registrationScheduleDate), "yyyy-MM-dd") === date && b.slotId === slotIndex + 1
        );

        if (lesson) {
            return (
                <Card className="bg-blue-100 h-full">
                    <CardContent className="p-2 text-sm">
                        <div className="font-bold truncate">{lesson.subjectName}</div>
                        <div>{lesson.className}</div>
                    </CardContent>
                </Card>
            );
        } else if (booking) {
            return (
                <Card className="bg-orange-100 h-full">
                    <CardContent className="p-2 text-sm">
                        <div className="font-bold truncate">{booking.labName}</div>
                        <div>{booking.className}</div>
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
        <div className="p-4">
            <div className="mt-2">
                <h1 className="text-2xl font-bold mb-5">Schedule Management</h1>
            </div>
            <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="grid w-1/2 grid-cols-2">
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="lab-booking">Lab Booking</TabsTrigger>
                </TabsList>
                <TabsContent value="schedule">
                    <div className="space-y-4 mt-4">
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
                </TabsContent>
                <TabsContent value="lab-booking">
                    <LabBookingTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}