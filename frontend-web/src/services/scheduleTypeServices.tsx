import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createScheduleType = async (data: { slotId: number; scheduleTypeName: string; scheduleTypeDescription: string; scheduleTypeDow: string; scheduleTypeStatus: string }) => {
    const response = await defaultAxiosInstance.post("/api/scheduletype", data);
    toast.success("Schedule type created successfully");
    return response.data;
};

export const getAllScheduleTypes = async () => {
    const response = await defaultAxiosInstance.get("/api/scheduletype");
    return response.data;
};

export const getScheduleTypeById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/scheduletype/${id}`);
    return response.data;
};

export const updateScheduleType = async (id: string, data: { slotId: number; scheduleTypeName: string; scheduleTypeDescription: string; scheduleTypeDow: string; scheduleTypeStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/scheduletype/${id}`, data);
    toast.success("Schedule type updated successfully");
    return response.data;
};

export const deleteScheduleType = async (id: string) => {
    const response = await defaultAxiosInstance.delete(`/api/scheduletype/${id}`);
    toast.success("Schedule type deleted successfully");
    return response.data;
};

export const getAvailableScheduleTypes = async () => {
    const response = await defaultAxiosInstance.get("/api/scheduletype/available");
    return response.data;
};