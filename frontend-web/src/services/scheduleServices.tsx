import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const getSchedule = async () => {
    const response = await defaultAxiosInstance.get("/api/schedule");
    return response.data;
};

export const getScheduleByStudentId = async (studentId: string) => {
    const response = await axiosWithoutLoading.get(`/api/schedule/student/${studentId}`);
    return response.data;
};

export const getScheduleByLectureId = async (lectureId: string) => {
    const response = await axiosWithoutLoading.get(`/api/schedule/lecture/${lectureId}`);
    return response.data;
};

export const addScheduleForClass = async (data: { classId: number; scheduleTypeId: number }) => {
    const response = await defaultAxiosInstance.post("/api/schedule/addScheduleForClass", data);
    toast.success("Schedule added successfully");
    return response.data;
};