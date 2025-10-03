import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createKitTemplate = async (data: { kitTemplateName: string; kitTemplateDescription: string; kitTemplateUrlImg: string; listAccessory: { accessoryId: number; accessoryQuantity: number }[] }) => {
    const response = await defaultAxiosInstance.post("/api/kittemplate/kittempalte", data);
    return response.data;
};

export const searchKitTemplate = async (data: { pageNum: number; pageSize: number; keyWord: string; status: string }) => {
    const response = await defaultAxiosInstance.post("/api/kittemplate/search", data);
    return response.data;
};

export const getKitTemplateById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/kittemplate/${id}`);
    return response.data;
};

export const updateKitTemplate = async (id: string, data: { kitTemplateName: string; kitTemplateQuantity: number; kitTemplateDescription: string; kitTemplateUrlImg: string; kitTemplateStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/kittemplate/${id}`, data);
    toast.success("Kit template updated successfully");
    return response.data;
};

export const deleteKitTemplate = async (id: string) => {
    const response = await defaultAxiosInstance.post(`/api/kittemplate/delete/${id}`);
    toast.success("Kit template deleted successfully");
    return response.data;
};