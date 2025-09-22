import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const searchTeamKit = async (data: { pageNum: number; pageSize: number; keyWord: string }) => {
    const response = await defaultAxiosInstance.post("/api/teamkit/search", data);
    return response.data;
};

export const borrowTeamKit = async (data: { teamId: number; kitId: string; teamKitName: string; teamKitDescription: string }) => {
    const response = await defaultAxiosInstance.post("/api/teamkit/borrowkit", data);
    toast.success("Kit borrowed successfully");
    return response.data;
};

export const giveBackTeamKit = async (teamKit: number) => {
    const response = await defaultAxiosInstance.post(`/api/teamkit/givebackkit?teamKit=${teamKit}`);
    toast.success("Kit returned successfully");
    return response.data;
};

export const getTeamKitById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamkit/${id}`);
    return response.data;
};

export const updateTeamKit = async (id: string, data: any) => {
    const response = await defaultAxiosInstance.put(`/api/teamkit/${id}`, data);
    toast.success("Kit updated successfully");
    return response.data;
};

export const getTeamKitByTeamId = async (teamId: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamkit/listteamkitteamid/${teamId}`);
    return response.data;
};

export const deleteTeamKit = async (id: string) => {
    const response = await defaultAxiosInstance.post(`/api/teamkit/delete/${id}`);
    toast.success("Kit deleted successfully");
    return response.data;
};