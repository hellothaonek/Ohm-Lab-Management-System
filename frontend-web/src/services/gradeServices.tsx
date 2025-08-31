import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createTeamGrade = async (labId: string, teamId: string, data: { grade: number, classId: number, gradeDescription: string, gradeStatus: string }) => {
    const response = await defaultAxiosInstance.post(`/api/grade/labs/${labId}/teams/${teamId}/grade`, data);
    toast.success("Create team grade successful");
    return response.data;
};

export const getTeamGrade = async (labId: string, teamId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/labs/${labId}/teams/${teamId}/grade`);
    return response.data;
};

export const getPendingTeams = async (labId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/labs/${labId}/pending-teams`);
    return response.data;
};

export const getMyIndividualGrade = async (labId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/labs/${labId}/my-individual-grade`);
    return response.data;
};

export const getTeamGradeStatistics = async (labId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/labs/${labId}/team-grade-statistics`);
    return response.data;
};

export const getAllGrades = async (labId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/labs/${labId}/all-grades`);
    return response.data;
};