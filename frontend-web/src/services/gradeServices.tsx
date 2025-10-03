import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createTeamGrade = async (labId: string, teamId: string, data: { grade: number, classId: number, gradeDescription: string, gradeStatus: string }) => {
    const response = await defaultAxiosInstance.post(`/api/grade/labs/${labId}/teams/${teamId}/grade`, data);
    toast.success("Create team grade successful");
    return response.data;
};

export const createIndividualStudentGrade = async (labId: string, teamId: string, studentId: string, data: { individualGrade: number, individualComment: string }) => {
    const response = await defaultAxiosInstance.post(`/api/grade/labs/${labId}/teams/${teamId}/members/${studentId}/grade`, data);
    toast.success("Create individual student grade successful");
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

export const getGradeForLabId = async (labId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/labs/${labId}/grade-for-id`);
    return response.data;
};

export const getAllGrades = async (labId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/labs/${labId}/all-grades`);
    return response.data;
};

export const getStudentGradeLabs = async (studentId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/students/${studentId}/labs`);
    return response.data;
};

export const getClassGrades = async (classId: string) => {
    const response = await axiosWithoutLoading.get(`/api/grade/classes/${classId}/grades`);
    return response.data;
};

export const updateClassGrades = async (classId: number, data: { grades: { studentId: string, labId: string, grade: number, gradeDescription: string, gradeStatus: string }[] }) => {
    const response = await defaultAxiosInstance.put(`/api/grade/classes/${classId}/grades`, data);
    toast.success("Update class grades successful");
    return response.data;
};

export const updateTeamGrade = async (labId: number, teamId: number, data: { grade: number, description: string }) => {
    const response = await defaultAxiosInstance.put(`/api/grade/labs/${labId}/teams/${teamId}/grades`, data);
    toast.success("Update team grade successful");
    return response.data;
};