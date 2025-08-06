import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const addClassUser = async (data: any) => {
    const response = await defaultAxiosInstance.post("/api/classuser/add", data);
    return response.data;
};

export const getClassUserById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/classuser/${id}`);
    return response.data;
};

export const getClassUserByClassId = async (classId: string) => {
    const response = await axiosWithoutLoading.get(`/api/classuser/class/${classId}`);
    return response.data;
};

export const getClassUserByUserId = async (userId: string) => {
    const response = await axiosWithoutLoading.get(`/api/classuser/user/${userId}`);
    return response.data;
};

export const removeClassUser = async (data: any) => {
    const response = await defaultAxiosInstance.delete("/api/classuser/remove", { data });
    return response.data;
};

export const checkClassUser = async () => {
    const response = await axiosWithoutLoading.get("/api/classuser/check");
    return response.data;
};