import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const getSubjects = async () => {
    try {
        const response = await defaultAxiosInstance.get("/api/course/subjects");
        // API trả về pageData chứa array subjects
        return response.data?.pageData || [];
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return [];
    }
};

export const createSubject = async (data: { subjectName: string; subjectCode: string; subjectDescription: string; semesterId: string }) => {
    const response = await defaultAxiosInstance.post("/api/course/subjects", data);
    toast.success("Subject created successfully");
    return response.data;
};

export const getSubjectById = async (id: number) => {
    const response = await axiosWithoutLoading.get(`/api/course/subjects/${id}`);
    return response.data;
};

export const updateSubject = async (id: string, data: { subjectName: string; subjectDescription: string; subjectStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/course/subjects/${id}`, data);
    return response.data;
};

export const deleteSubject = async (id: string) => {
    const response = await defaultAxiosInstance.delete(`/api/course/subjects/${id}`);
    return response.data;
};

export const getLabsBySubjectId = async (subjectId: string) => {
    const response = await defaultAxiosInstance.get(`/api/course/subjects/${subjectId}/labs`);
    return response.data;
};

export const getLabById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/course/labs/${id}`);
    return response.data;
};

export const updateLab = async (id: string, data: { labName: string; labRequest: string; labTarget: string; labStatus: string }) => {
    const response = await defaultAxiosInstance.put(`/api/course/labs/${id}`, data);
    return response.data;
};

export const deleteLab = async (id: string) => {
    const response = await defaultAxiosInstance.delete(`/api/course/labs/${id}`);
    return response.data;
};

export const createLab = async (data: { subjectId: number; labName: string; labRequest: string; labTarget: string; labStatus: string; requiredEquipments: { equipmentTypeId: string }[]; requiredKits: { kitTemplateId: string }[] }) => {
    const response = await defaultAxiosInstance.post("/api/course/labs", data)
    toast.success("Lab created successfully")
    return response.data
}
