import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createKit = async (data: { kitTemplateId: string; kitName: string; kitDescription: string; kitUrlImg: string; }) => {
    const response = await defaultAxiosInstance.post("/api/kit/kit", data);
    return response.data;
};

export const searchKit = async (data: { pageNum: number; pageSize: number; keyWord: string; status: string }) => {
    const response = await defaultAxiosInstance.post("/api/kit/search", data);
    return response.data;
};

export const searchKitByKitTemplateId = async (kitTemplateId: string) => {
    const response = await defaultAxiosInstance.post(`/api/kit/searchbykittemplateid/${kitTemplateId}`);
    return response.data;
};

export const getKitById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/kit/${id}`);
    return response.data;
};

export const updateKit = async (id: string, data: { kitTemplateId: string; kitName: string; kitDescription: string; kitUrlImg: string; kitUrlQr: string; kitCreateDate: string; kitStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/kit/${id}`, data);
    toast.success("Kit updated successfully");
    return response.data;
};

export const deleteKit = async (id: string) => {
    const response = await defaultAxiosInstance.post(`/api/kit/delete/${id}`);
    toast.success("Kit deleted successfully");
    return response.data;
};