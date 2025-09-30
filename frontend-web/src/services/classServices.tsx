import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createClass = async (data: { subjectId: number; lecturerId: string; scheduleTypeId: number; className: string; classDescription: string; classStatus: string; }) => {
    const response = await defaultAxiosInstance.post("/api/class", data);
    toast.success("Create class successful");
    return response.data;
};

export const getAllClasses = async () => {
    const response = await axiosWithoutLoading.get(`/api/class`);
    return response.data;
};

export const getClassById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/class/${id}`);
    return response.data;
};

export const updateClass = async (id: string, data: { subjectId: number; lecturerId: string; scheduleTypeId: number; className: string; classDescription: string; classStatus: string; }) => {
    const response = await defaultAxiosInstance.put(`/api/class/${id}`, data);
    return response.data;
};

export const getClassByLecturerId = async (lecturerId: string) => {
    const response = await axiosWithoutLoading.get(`/api/class/lecturer/${lecturerId}`);
    return response.data;
};

export const getClassByStudentId = async (studentId: string) => {
    const response = await axiosWithoutLoading.get(`/api/class/student/${studentId}`);
    return response.data;
};

export const updateClassStatus = async (id: string, status: string) => {
    const response = await defaultAxiosInstance.put(`/api/class/${id}/status`, { status });
    return response.data;
};

export const addScheduleForClass = async (data: { classId: number; scheduleTypeId: number }) => {
    const response = await defaultAxiosInstance.post(`/api/class/addscheduleforclass`, data);
    toast.success("Create schedule for class successful");
    return response.data;
};

export const getLabByClassId = async (classId: string) => {
    const response = await axiosWithoutLoading.get(`/api/class/${classId}/labs`);
    return response.data;
};