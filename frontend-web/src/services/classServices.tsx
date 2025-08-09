import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";
import { CreateClassData, UpdateClassData } from "../types/class";

export const createClass = async (data: CreateClassData) => {
    try {
        const response = await defaultAxiosInstance.post("/api/class", data);
        toast.success("Create class successful");
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Failed to create class");
        }
        throw error;
    }
};

export const getAllClasses = async () => {
    try {
        const response = await axiosWithoutLoading.get("/api/class");
        // API trả về trực tiếp array classes
        return response.data || [];
    } catch (error) {
        console.error("Error fetching classes:", error);
        return [];
    }
};

export const getClassById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/class/${id}`);
    return response.data;
};

export const updateClass = async (id: string, data: UpdateClassData) => {
    try {
        const response = await defaultAxiosInstance.put(`/api/class/${id}`, data);
        toast.success("Update class successful");
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Failed to update class");
        }
        throw error;
    }
};

export const deleteClass = async (id: string) => {
    try {
        const response = await defaultAxiosInstance.delete(`/api/class/${id}`);
        toast.success("Delete class successful");
        return response.data;
    } catch (error: any) {

        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Failed to delete class");
        }
        throw error; 
    }
};

export const getClassByLecturerId = async (lecturerId: string) => {
    const response = await axiosWithoutLoading.get(`/api/class/lecturer/${lecturerId}`);
    return response.data;
};