import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const addTeamUser = async (teamId: string, userId: string) => {
    const response = await defaultAxiosInstance.post(`/api/teamuser/team/${teamId}/user/${userId}`);
    return response.data;
};

export const getTeamUserById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamuser/${id}`);
    return response.data;
};

export const getTeamUsersByTeamId = async (teamId: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamuser/team/${teamId}`);
    return response.data;
};

export const getTeamUsersByUserId = async (userId: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamuser/user/${userId}`);
    return response.data;
};

export const deleteTeamUser = async (teamUserId: string) => {
    const response = await defaultAxiosInstance.delete(`/api/teamuser/${teamUserId}`);
    return response.data;
};

export const checkTeamUser = async (teamId: string, userId: string) => {
    const response = await axiosWithoutLoading.get(`/api/teamuser/check/team/${teamId}/user/${userId}`);
    return response.data;
};