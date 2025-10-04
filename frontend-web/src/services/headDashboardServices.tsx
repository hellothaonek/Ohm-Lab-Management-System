import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

// New functions for HeadOfDepartment APIs
export const getDashboard = async () => {
    const response = await defaultAxiosInstance.get("/api/head-of-department/dashboard");
    return response.data;
};

export const postMonitoringOverview = async (data: any) => {
    const response = await defaultAxiosInstance.post("/api/head-of-department/monitoring/overview", data);
    return response.data;
};

export const getSubjectStatistics = async () => {
    const response = await defaultAxiosInstance.get("/api/head-of-department/monitoring/subject-statistics");
    return response.data;
};

export const getLecturerPerformance = async () => {
    const response = await defaultAxiosInstance.get("/api/head-of-department/monitoring/lecturer-performance");
    return response.data;
};

export const getEquipmentUsage = async () => {
    const response = await defaultAxiosInstance.get("/api/head-of-department/monitoring/equipment-usage");
    return response.data;
};