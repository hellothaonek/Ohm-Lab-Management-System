import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

// Student/Lecturer
export const createReport = async (data: { reportTitle: string, reportDescription: string, selectedSlot: string, selectedClass: string }) => {
    const response = await defaultAxiosInstance.post("/api/report", data);
    return response.data;
};

export const getMyReports = async () => {
    const response = await axiosWithoutLoading.get("/api/report/my-reports");
    return response.data;
};

export const getTodaySlots = async () => {
    const response = await axiosWithoutLoading.get("/api/report/today-slots");
    return response.data;
};

export const getTodayClasses = async () => {
    const response = await axiosWithoutLoading.get("/api/report/today-classes");
    return response.data;
};

export const getReportById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/report/${id}`);
    return response.data;
};

// Admin/Head - Get all reports
export const getAllReports = async () => {
    const response = await axiosWithoutLoading.get("/api/report");
    return response.data;
};

// Admin/Head - Get report detail by ID
export const getReportDetailById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/report/${id}/detail`);
    return response.data;
};

// Admin/Head - Update report status
export const updateReportStatus = async (id: string, data: { reportStatus: string, resolutionNotes: string }) => {
    const response = await defaultAxiosInstance.put(`/api/report/${id}/status`, data);
    toast.success("Report status updated successfully");
    return response.data;
};