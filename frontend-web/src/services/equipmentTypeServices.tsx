import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createEquipmentType = async (data: { equipmentType: string }) => {
    const response = await defaultAxiosInstance.post("/api/equipmenttype/equipmenttype", data);
    toast.success("Equipment type created successfully");
    return response.data;
};

export const searchEquipmentType = async (data: { pageNum: number; pageSize: number; keyWord: string; status: string }) => {
    const response = await defaultAxiosInstance.post("/api/equipmenttype/search", data);
    return response.data;
};

export const getEquipmentTypeById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/equipmenttype/${id}`);
    return response.data;
};

export const updateEquipmentType = async (id: string, data: { equipmentType: string }) => {
    const response = await defaultAxiosInstance.put(`/api/equipmenttype/${id}`, data);
    toast.success("Equipment type updated successfully");
    return response.data;
};

export const deleteEquipmentType = async (id: string) => {
    const response = await defaultAxiosInstance.post(`/api/equipmenttype/delete/${id}`);
    toast.success("Equipment type deleted successfully");
    return response.data;
};