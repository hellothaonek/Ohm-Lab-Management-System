import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createSlot = async (data: { slotName: string; slotStartTime: string; slotEndTime: string; slotDescription: string; slotStatus: string }) => {
    const response = await defaultAxiosInstance.post("/api/slot", data);
    return response.data;
};

export const getAllSlots = async () => {
    const response = await axiosWithoutLoading.get("/api/slot");
    return response.data;
};

export const getSlotById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/slot/${id}`);
    return response.data;
};

export const updateSlot = async (id: string, data: { slotName: string; slotStartTime: string; slotEndTime: string; slotDescription: string; slotStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/slot/${id}`, data);
    toast.success("Slot updated successfully");
    return response.data;
};

export const deleteSlot = async (id: string) => {
    const response = await defaultAxiosInstance.delete(`/api/slot/${id}`);
    toast.success("Slot deleted successfully");
    return response.data;
};