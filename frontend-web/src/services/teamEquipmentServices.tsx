import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const searchTeamEquipment = async (data: { pageNum: number; pageSize: number; keyWord: string }) => {
    const response = await defaultAxiosInstance.post("/api/teamequipment/search", data);
    return response.data;
};

export const searchTeamEquipmentByLecturerId = async (data: { pageNum: number; pageSize: number; lecturerId: string }) => {
    const response = await defaultAxiosInstance.post("/api/teamequipment/searchbylecturerid", data);
    return response.data;
};

export const borrowEquipment = async (data: { teamId: string; equipmentId: string; teamEquipmentName: string; teamEquipmentDescription: string }) => {
    const response = await defaultAxiosInstance.post("/api/teamequipment/borrowequipment", data);
    toast.success("Equipment borrowed successfully");
    return response.data;
};

export const giveBackEquipment = async (teamEquipment: number) => {
    const response = await defaultAxiosInstance.post(`/api/teamequipment/givebackequipment?teamEquipment=${teamEquipment}`);
    toast.success("Equipment returned successfully");
    return response.data;
};

export const getTeamEquipmentById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamequipment/${id}`);
    return response.data;
};

export const getTeamEquipmentByTeamId = async (teamId: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamequipment/listteamequipmentbyteamid/${teamId}`);
    return response.data;
};

export const getTeamEquipmentByEquipmentId = async (equipmentId: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamequipment/listteamequipmentbyequipmentid/${equipmentId}`);
    return response.data;
};