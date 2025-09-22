import { defaultAxiosInstance } from "./axios.config";

export const getStudentDashboard = async () => {
    const response = await defaultAxiosInstance.get("/api/student/dashboard");
    return response.data;
};

export const getLabInstructions = async (labId: string) => {
    const response = await defaultAxiosInstance.get(`/api/student/dashboard/labs/${labId}/instructions`);
    return response.data;
};

export const getEnhancedSchedules = async () => {
    const response = await defaultAxiosInstance.get("/api/student/dashboard/schedules/enhanced");
    return response.data;
};