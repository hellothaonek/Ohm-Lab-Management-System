import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

// API Accessory
export const searchAccessory = async (data: { pageNum: number; pageSize: number; keyWord: string; status: string }) => {
    const response = await defaultAxiosInstance.post("/api/accessory/search", data);
    return response.data;
};

export const getAccessoryById = async (id: number) => {
    const response = await axiosWithoutLoading.get(`/api/accessory/${id}`);
    return response.data;
};

export const updateAccessory = async (id: string, data: { accessoryName: string; accessoryDescription: string; accessoryUrlImg: string; accessoryValueCode: string; accessoryCase: string; accessoryStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/accessory/${id}`, data);
    toast.success("Accessory updated successfully");
    return response.data;
};

export const createAccessory = async (data: { accessoryName: string; accessoryDescription: string; accessoryUrlImg: string; accessoryValueCode: string; accessoryCase: string }) => {
    const response = await defaultAxiosInstance.post("/api/accessory/accessory", data);
    return response.data;
};

export const deleteAccessory = async (id: number) => {
    const response = await defaultAxiosInstance.post(`/api/accessory/delete/${id}`);
    toast.success("Accessory deleted successfully");
    return response.data;
};

// API AccessoryKitTemplate

export const searchAccessoryKitTemplate = async (data: { pageNum: number; pageSize: number; keyWord: string; status: string }) => {
    const response = await defaultAxiosInstance.post("/api/accessorykittemplate/search", data);
    return response.data;
};

export const getAccessoryKitTemplateByKitTemplateId = async (kitTemplateId: string) => {
    const response = await axiosWithoutLoading.get(`/api/accessorykittemplate/kittemplate/${kitTemplateId}`);
    return response.data;
};

export const getAccessoryKitTemplateById = async (id: number) => {
    const response = await axiosWithoutLoading.get(`/api/accessorykittemplate/${id}`);
    return response.data;
};

export const updateAccessoryKitTemplate = async (id: number, data: { kitTemplateId: string; accessoryId: number; accessoryQuantity: number; accessoryKitTemplateStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/accessorykittemplate/${id}`, data);
    toast.success("Accessory Kit Template updated successfully");
    return response.data;
};

export const createAccessoryKitTemplate = async (data: { kitTemplateId: string; accessoryId: number; accessoryQuantity: number }) => {
    const response = await defaultAxiosInstance.post("/api/accessorykittemplate/accessorykittemplate", data);
    return response.data;
};

export const deleteAccessoryKitTemplate = async (id: number) => {
    const response = await defaultAxiosInstance.post(`/api/accessorykittemplate/delete/${id}`);
    toast.success("Accessory Kit Template deleted successfully");
    return response.data;
};

// API KiAccessory

export const searchKiAccessory = async (data: { pageNum: number; pageSize: number; keyWord: string; status: string }) => {
    const response = await defaultAxiosInstance.post("/api/kitaccessory/search", data);
    return response.data;
};

export const getKiAccessoryByKitId = async (kitId: string) => {
    const response = await axiosWithoutLoading.get(`/api/kitaccessory/kit/${kitId}`);
    console.log("check API:", response)
    return response.data;
};

export const getKiAccessoryById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/kitaccessory/${id}`);
    return response.data;
};

export const updateKiAccessory = async (id: string, data: { kitId: string; accessoryId: number; accessoryQuantity: number; kitAccessoryStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/kitaccessory/${id}`, data);
    toast.success("Kit Accessory updated successfully");
    return response.data;
};

export const createKiAccessory = async (data: { /* add fields as needed */ }) => {
    const response = await defaultAxiosInstance.post("/api/kitaccessory/kitaccessory", data);
    return response.data;
};

export const deleteKiAccessory = async (id: string) => {
    const response = await defaultAxiosInstance.post(`/api/kitaccessory/delete/${id}`);
    toast.success("Ki Accessory deleted successfully");
    return response.data;
};