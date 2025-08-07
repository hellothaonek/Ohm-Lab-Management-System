"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { addDays, startOfWeek, format, eachWeekOfInterval } from "date-fns";
import DashboardLayout from "@/components/dashboard-layout";

const mockSchedule = [
  {
    subjectCode: "PRM392",
    subjectName: "Project Management",
    lecturer: "Dr. John Smith",
    date: "2025-08-04",
    slot: 1,
    room: "NVH 309",
    time: "7:30 - 9:30",
    status: "attended"
  },
  {
    subjectCode: "MMA301",
    subjectName: "Math for AI",
    lecturer: "Prof. Jane Doe",
    date: "2025-08-06",
    slot: 3,
    room: "NVH 609",
    time: "12:30 - 14:45",
    status: "upcoming"
  }
];

const slots = [
  "7:30 - 9:30",
  "9:45 - 11:45",
  "12:30 - 14:30",
  "14:45 - 16:45",
  "17:00 - 19:00",
  "19:15 - 21:15"
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HeadSchedule() {
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<{ value: string; label: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedLecturer, setSelectedLecturer] = useState<string>("all");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    const weekStarts = eachWeekOfInterval(
      { start: startOfYear, end: endOfYear },
      { weekStartsOn: 1 }
    );

    const weekOptions = weekStarts.map((weekStart) => {
      const weekEnd = addDays(weekStart, 6);
      return {
        value: format(weekStart, "yyyy-MM-dd"),
        label: `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM/yyyy")}`
      };
    });

    weekOptions.sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime());
    setWeeks(weekOptions);

    const dates = Array.from({ length: 7 }).map((_, i) =>
      format(addDays(selectedWeekStart, i), "yyyy-MM-dd")
    );
    setWeekDates(dates);
  }, [selectedWeekStart]);

  const handleWeekChange = (value: string) => {
    setSelectedWeekStart(new Date(value));
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
  };

  const handleLecturerChange = (value: string) => {
    setSelectedLecturer(value);
  };

  const handleCreateSchedule = () => {
    console.log("Create Schedule button clicked");
  };

  const uniqueSubjects = Array.from(new Set(mockSchedule.map((lesson) => lesson.subjectCode)));
  const uniqueLecturers = Array.from(new Set(mockSchedule.map((lesson) => lesson.lecturer)));

  const renderCell = (day: string, slotIndex: number) => {
    const date = weekDates[days.indexOf(day)];
    const lesson = mockSchedule.find((l) =>
      l.date === date &&
      l.slot === slotIndex + 1 &&
      (selectedSubject === "all" || l.subjectCode === selectedSubject) &&
      (selectedLecturer === "all" || l.lecturer === selectedLecturer)
    );

    if (!lesson) return <div className="border p-2 min-h-[80px]" />;

    return (
      <Card className="bg-blue-100 h-full">
        <CardContent className="p-2 text-sm">
          <div className="font-bold">{lesson.subjectCode}</div>
          <div>{lesson.lecturer}</div>
          <div className="text-xs text-muted-foreground">{lesson.time}</div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout role="lecturer">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select onValueChange={handleWeekChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={format(selectedWeekStart, "dd/MM/yyyy")} />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((week) => (
                  <SelectItem key={week.value} value={week.value}>
                    {week.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleSubjectChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleLecturerChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Lecturer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lecturers</SelectItem>
                {uniqueLecturers.map((lecturer) => (
                  <SelectItem key={lecturer} value={lecturer}>
                    {lecturer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateSchedule} className="bg-orange-500 hover:bg-orange-600">
            Create Schedule
          </Button>
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