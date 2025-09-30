"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { format, isValid } from "date-fns";
import { getAllScheduleTypes } from "@/services/scheduleTypeServices";
import { getAllSlots } from "@/services/slotServices";
import CreateScheduleType from "@/components/admin/schedule/CreateScheduleType";
import EditScheduleType from "@/components/admin/schedule/EditScheduleType";
import DeleteScheduleType from "@/components/admin/schedule/DeleteScheduleType";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const scheduleTypeColors: { [key: string]: string } = {
    A1: "bg-blue-100",
    A2: "bg-green-100",
    A3: "bg-yellow-100",
    A4: "bg-red-100",
    A5: "bg-purple-200",
    A6: "bg-pink-100",
    P1: "bg-teal-100",
    P2: "bg-orange-100",
    P3: "bg-indigo-100",
    P4: "bg-cyan-100",
    P5: "bg-lime-100",
    P6: "bg-amber-100"
};

export default function AdminSchedule() {
    const [scheduleTypes, setScheduleTypes] = useState([]);
    const [slots, setSlots] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editScheduleId, setEditScheduleId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteScheduleId, setDeleteScheduleId] = useState<number | null>(null);
    const [deleteScheduleName, setDeleteScheduleName] = useState("");

    const fetchScheduleTypes = async () => {
        try {
            const response = await getAllScheduleTypes();
            // console.log(">>> Schedule Types:", response);
            setScheduleTypes(response);
        } catch (error) {
            console.error("Error fetching schedule types:", error);
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await getAllSlots();
            console.log(">>> Slots:", response);
            setSlots(response); 
        } catch (error) {
            console.error("Error fetching slots:", error);
        }
    };

    useEffect(() => {
        fetchScheduleTypes();
        fetchSlots();
    }, []);

    const handleSuccess = () => {
        fetchScheduleTypes();
    };

    const getDaysFromScheduleTypeDow = (scheduleTypeDow: string) => {
        const dayMap: { [key: string]: string } = {
            Monday: "Mon",
            Tuesday: "Tue",
            Wednesday: "Wed",
            Thursday: "Thu",
            Friday: "Fri",
            Saturday: "Sat",
            Sunday: "Sun"
        };

        return scheduleTypeDow
            .split(",")
            .map((day) => dayMap[day.trim()])
            .filter(Boolean);
    };

    const getSlotIndex = (slotId: number) => {
        return slots.findIndex((slot: any) => slot.slotId === slotId);
    };

    const handleEdit = (schedule: any) => {
        setEditScheduleId(schedule.scheduleTypeId);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (schedule: any) => {
        setDeleteScheduleId(schedule.scheduleTypeId);
        setDeleteScheduleName(schedule.scheduleTypeName);
        setIsDeleteDialogOpen(true);
    };

    const renderCell = (day: string, slotIndex: number) => {
        const matchingSchedules = scheduleTypes.filter((schedule: any) => {
            const scheduleDays = getDaysFromScheduleTypeDow(schedule.scheduleTypeDow);
            const scheduleSlotIndex = getSlotIndex(schedule.slotId);
            return scheduleDays.includes(day) && scheduleSlotIndex === slotIndex;
        });

        return (
            <div className="border p-2 min-h-[80px] flex flex-col items-center justify-center gap-2 w-full h-full">
                {matchingSchedules.map((schedule: any, index: number) => (
                    <Card
                        key={index}
                        className={`${scheduleTypeColors[schedule.scheduleTypeName] || "bg-gray-100"} w-full h-full flex items-center justify-center relative`}
                    >
                        <CardContent className="p-2 flex items-center justify-center w-full h-full">
                            <div className="text-sm font-bold">{schedule.scheduleTypeName}</div>
                        </CardContent>
                        <div className="absolute top-1 right-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(schedule)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(schedule)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    const formatTime = (startTime: string | null, endTime: string | null) => {
        // Validate inputs
        if (!startTime || !endTime) {
            console.warn("Missing time values:", { startTime, endTime });
            return `${startTime || "N/A"} - ${endTime || "N/A"}`;
        }

        try {
            // Normalize time to HH:mm:ss format
            const normalizeTime = (time: string) => {
                // Ensure HH:mm format
                const parts = time.trim().split(":");
                if (parts.length !== 2) {
                    throw new Error(`Invalid time format: ${time}`);
                }
                const [hours, minutes] = parts.map((part) => parseInt(part, 10));
                if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                    throw new Error(`Invalid time components: ${time}`);
                }
                return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
            };

            const normalizedStart = normalizeTime(startTime);
            const normalizedEnd = normalizeTime(endTime);

            const startDate = new Date(`1970-01-01T${normalizedStart}`);
            const endDate = new Date(`1970-01-01T${normalizedEnd}`);

            if (!isValid(startDate) || !isValid(endDate)) {
                console.warn("Invalid date objects created:", { normalizedStart, normalizedEnd });
                return `${startTime} - ${endTime}`; // Fallback to raw values
            }

            const start = format(startDate, "HH:mm");
            const end = format(endDate, "HH:mm");
            return `${start} - ${end}`;
        } catch (error) {
            console.error("Error formatting time:", error, { startTime, endTime });
            return `${startTime} - ${endTime}`; // Fallback to raw values
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            </div>
            <div className="flex items-center justify-end gap-4">
                <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    aria-label="Create new schedule"
                    onClick={() => setIsDialogOpen(true)}
                >
                    Create Schedule
                </Button>
            </div>

            <div className="grid grid-cols-9 gap-px border rounded overflow-hidden text-center text-sm">
                <div className="bg-gray-100 font-bold p-2">Time</div>
                <div className="bg-gray-100 font-bold p-2">Slot</div>
                {days.map((d) => (
                    <div key={d} className="bg-gray-100 font-bold p-2">
                        <div>{d}</div>
                    </div>
                ))}

                {slots.map((slot: any, slotIdx: number) => (
                    <div key={`slot-${slotIdx}`} className="contents">
                        <div className="bg-gray-100 p-2 min-h-[80px] flex items-center justify-center">
                            {formatTime(slot.slotStartTime, slot.slotEndTime)}
                        </div>
                        <div className="bg-gray-100 p-2 min-h-[80px] flex items-center justify-center">{slot.slotName}</div>
                        {days.map((d) => (
                            <div key={`${d}-${slotIdx}`} className="min-h-[80px]">
                                {renderCell(d, slotIdx)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <CreateScheduleType
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={handleSuccess}
            />
            <EditScheduleType
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                scheduleTypeId={editScheduleId}
                onSuccess={handleSuccess}
            />
            <DeleteScheduleType
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                scheduleTypeId={deleteScheduleId}
                scheduleTypeName={deleteScheduleName}
                onSuccess={handleSuccess}
            />
        </div>
    );
}