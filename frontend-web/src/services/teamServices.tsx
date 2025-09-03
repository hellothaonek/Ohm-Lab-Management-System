import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createTeam = async (data: { classId: number; teamName: string; teamDescription: string; teamStatus: string }) => {
    const response = await defaultAxiosInstance.post("/api/team", data);
    return response.data;
};

export const getAllTeams = async () => {
    const response = await axiosWithoutLoading.get("/api/team");
    return response.data;
};

export const getTeamById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/team/${id}`);
    return response.data;
};

export const updateTeam = async (id: string, data: any) => {
    const response = await defaultAxiosInstance.put(`/api/team/${id}`, data);
    return response.data;
};

export const deleteTeam = async (id: string) => {
    const response = await defaultAxiosInstance.delete(`/api/team/${id}`);
    return response.data;
};

export const getTeamsByClassId = async (classId: string) => {
    const response = await axiosWithoutLoading.get(`/api/team/class/${classId}`);
    return response.data;
};