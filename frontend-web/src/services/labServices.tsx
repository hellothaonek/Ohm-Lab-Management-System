import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createLab = async (data: { subjectId: number; labName: string; labRequest: string; labTarget: string; labStatus: string; requiredEquipments: { equipmentTypeId: string }[]; requiredKits: { kitTemplateId: string }[] }) => {
    const response = await defaultAxiosInstance.post("/api/labs", data);
    toast.success("Lab created successfully");
    return response.data;
};

export const getLabs = async () => {
    const response = await defaultAxiosInstance.get("/api/labs");
    return response.data;
};

export const getMyClasses = async () => {
    const response = await defaultAxiosInstance.get("/api/labs/my-classes");
    return response.data;
};

export const scheduleLab = async (labId: string, data: { classId: number; scheduledDate: string; slotId: number; scheduleDescription: string; maxStudentsPerSession: number; lecturerNotes: string }) => {
    const response = await defaultAxiosInstance.post(`/api/labs/${labId}/schedule`, data);
    toast.success("Lab scheduled successfully");
    return response.data;
};

export const getLabById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/labs/${id}`);
    return response.data;
};

export const updateLab = async (id: string, data: { subjectId: number; labName: string; labRequest: string; labTarget: string; labStatus: string; requiredEquipments: { equipmentTypeId: string }[]; requiredKits: { kitTemplateId: string }[] }) => {
    const response = await defaultAxiosInstance.put(`/api/labs/${id}`, data);
    return response.data;
};

export const deleteLab = async (id: string) => {
    const response = await defaultAxiosInstance.delete(`/api/labs/${id}`);
    return response.data;
};

export const getLabBySubjectId = async (subjectId: string) => {
    const response = await defaultAxiosInstance.get(`/api/labs/subject/${subjectId}`);
    return response.data;
};

export const getLabByClassById = async (classId: string) => {
    const response = await defaultAxiosInstance.get(`/api/labs/class/${classId}`);
    return response.data;
};