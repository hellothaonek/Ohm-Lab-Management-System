"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getAllScheduleTypes } from "@/services/scheduleTypeServices";
import DashboardLayout from "@/components/dashboard-layout";

const slots = [
  "7:00 - 9:15",
  "9:30 - 11:45",
  "12:30 - 14:45",
  "15:00 - 17:15"
];

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

  const fetchScheduleTypes = async () => {
    try {
      const response = await getAllScheduleTypes();
      console.log(">>>", response)
      setScheduleTypes(response);
    } catch (error) {
      console.error("Error fetching schedule types:", error);
    }
  };

  useEffect(() => {
    fetchScheduleTypes();
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
      .split(",")
      .map((day) => dayMap[day.trim()])
      .filter(Boolean);
  };

  const getSlotIndex = (slotId: number) => {
    return slotId - 1;
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

  return (
    <DashboardLayout>
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

          {slots.map((time, slotIdx) => (
            <div key={`slot-${slotIdx}`} className="contents">
              <div className="bg-gray-100 p-2 min-h-[80px] flex items-center justify-center">{time}</div>
              <div className="bg-gray-100 p-2 min-h-[80px] flex items-center justify-center">{slotIdx + 1}</div>
              {days.map((d) => (
                <div key={`${d}-${slotIdx}`} className="min-h-[80px]">
                  {renderCell(d, slotIdx)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}