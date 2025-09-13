import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const getLabUsage = async (data: { startDate: string, endDate: string, subjectId: number }) => {
    const response = await defaultAxiosInstance.get("/api/analytics/lab-usage", { params: data });
    return response.data;
};

export const getLabUsageByMonth = async (year: number, month: number) => {
    const response = await axiosWithoutLoading.get(`/api/analytics/lab-usage/monthly/${year}/${month}`);
    return response.data;
};

export const getLabUsageDetails = async (data: { startDate: string, endDate: string, subjectId: number, lecturerId: string }) => {
    const response = await defaultAxiosInstance.get("/api/analytics/lab-usage/details", { params: data });
    return response.data;
};

export const getLabUsageBySemester = async (semesterId: string) => {
    const response = await axiosWithoutLoading.get(`/api/analytics/lab-usage/semester/${semesterId}`);
    return response.data;
};

export const getRecentLabUsage = async () => {
    const response = await defaultAxiosInstance.get("/api/analytics/lab-usage/recent");
    return response.data;
};

export const getCurrentMonthLabUsage = async () => {
    const response = await defaultAxiosInstance.get("/api/analytics/lab-usage/current-month");
    return response.data;
};

export const getSystemOverview = async () => {
    const response = await defaultAxiosInstance.get("/api/analytics/system-overview");
    return response.data;
};