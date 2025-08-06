import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createClass = async (data: { subjectId: number; lecturerId: string; scheduleTypeId: number; className: string; classDescription: string; classStatus: string; }) => {
    const response = await defaultAxiosInstance.post("/api/class", data);
    toast.success("Create class successful");
    return response.data;
};

export const getAllClasses = async () => {
    const response = await axiosWithoutLoading.get("/api/class");
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

export const deleteClass = async (id: string) => {
    const response = await defaultAxiosInstance.delete(`/api/class/${id}`);
    return response.data;
};

export const getClassByLecturerId = async (lecturerId: string) => {
    const response = await axiosWithoutLoading.get(`/api/class/lecturer/${lecturerId}`);
    return response.data;
};