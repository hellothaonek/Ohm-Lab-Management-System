"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format, isValid } from "date-fns";
import { getAllScheduleTypes } from "@/services/scheduleTypeServices";
import { getAllSlots } from "@/services/slotServices";
import DashboardLayout from "@/components/dashboard-layout";
import { ScheduleSkeleton } from "@/components/loading-skeleton";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const scheduleTypeColors: { [key: string]: string } = {
  A1: "bg-blue-100",
  A2: "bg-green-100",
  A3: "bg-yellow-100",
  A4: "bg-red-100",
  A5: "bg-purple-100",
  A6: "bg-pink-100",
  P1: "bg-teal-100",
  P2: "bg-orange-100",
  P3: "bg-indigo-100",
  P4: "bg-cyan-100",
  P5: "bg-lime-100",
  P6: "bg-amber-100"
};

export default function HeadSchedule() {
  const [scheduleTypes, setScheduleTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScheduleTypes = async () => {
    try {
      const response = await getAllScheduleTypes();
      console.log(">>> Schedule Types:", response);
      setScheduleTypes(response);
    } catch (error) {
      console.error("Error fetching schedule types:", error);
      setScheduleTypes([]);
    }
  };

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      const response = await getAllSlots();
      console.log(">>> Slots:", response);
      if (response) {
        setSlots(response);
      } else {
        console.warn("Invalid slots data:", response);
        setSlots([]);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleTypes();
    fetchSlots();
  }, []);

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
      ? scheduleTypeDow
        .split(",")
        .map((day) => dayMap[day.trim()])
        .filter(Boolean)
      : [];
  };

  const getSlotIndex = (slotId: number) => {
    return slots.findIndex((slot: any) => slot.slotId === slotId);
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
          </Card>
        ))}
      </div>
    );
  };

  const formatTime = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) {
      console.warn("Missing time values:", { startTime, endTime });
      return `${startTime || "N/A"} - ${endTime || "N/A"}`;
    }

    try {
      const normalizeTime = (time: string) => {
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
        return `${startTime} - ${endTime}`;
      }

      const start = format(startDate, "HH:mm");
      const end = format(endDate, "HH:mm");
      return `${start} - ${end}`;
    } catch (error) {
      console.error("Error formatting time:", error, { startTime, endTime });
      return `${startTime} - ${endTime}`;
    }
  };

  if (isLoading) return <ScheduleSkeleton />;

  if (!Array.isArray(slots) || slots.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-4 text-center">Không có slot nào được tìm thấy.</div>
      </DashboardLayout>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
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
    </div>
  );
}