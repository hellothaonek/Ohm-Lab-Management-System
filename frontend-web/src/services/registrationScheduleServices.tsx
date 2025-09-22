import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";

export const createRegistrationSchedule = async (data: { registrationScheduleName: string; teacherId: string; classId: number; labId: number; slotId: number; registrationScheduleDate: string; registrationScheduleDescription: string; }) => {
    const response = await defaultAxiosInstance.post(`/api/registrationschedule/registrationschedule`, data);
    toast.success("Registration schedule created successfully");
    return response.data;
};

export const searchRegistrationSchedule = async (data: { pageNum: number; pageSize: number; keyWord: string; status: string; }) => {
    const response = await defaultAxiosInstance.post(`/api/registrationschedule/search`, data);
    return response.data;
};

export const listRegistrationScheduleByTeacherId = async (teacherId: string) => {
    const response = await axiosWithoutLoading.get(`/api/registrationschedule/listregistrationschedulebyteacherid/${teacherId}`);
    return response.data;
};

export const getRegistrationScheduleById = async (id: string) => {
    const response = await axiosWithoutLoading.get(`/api/registrationschedule/registrationschedule/${id}`);
    return response.data;
};

export const updateRegistrationSchedule = async (id: string, data: { registrationScheduleName: string; teacherId: string; classId: number; labId: number; slotId: number; registrationScheduleDate: string; registrationScheduleDescription: string; registrationScheduleStatus: string; }) => {
    const response = await defaultAxiosInstance.put(`/api/registrationschedule/${id}`, data);
    toast.success("Registration schedule updated successfully");
    return response.data;
};

export const deleteRegistrationSchedule = async (id: string) => {
    const response = await defaultAxiosInstance.post(`/api/registrationschedule/delete/${id}`);
    toast.success("Registration schedule deleted successfully");
    return response.data;
};

export const acceptRegistrationSchedule = async (data: { registrationScheduleId: number; registrationScheduleNote: string; }) => {
    const response = await defaultAxiosInstance.post(`/api/registrationschedule/accept`, data);
    toast.success("Registration schedule accepted successfully");
    return response.data;
};

export const rejectRegistrationSchedule = async (data: { registrationScheduleId: number; registrationScheduleNote: string; }) => {
    const response = await defaultAxiosInstance.post(`/api/registrationschedule/reject`, data);
    toast.success("Registration schedule rejected successfully");
    return response.data;
};

export const checkDuplicateRegistrationSchedule = async (data: { registrationScheduleDate: string; slotId: number; }) => {
    const response = await defaultAxiosInstance.post(`/api/registrationschedule/checkdupplicate`, data);
    return response.data;
};

export const listSlotEmptyByDate = async (date: string) => {
    const response = await defaultAxiosInstance.post(`/api/registrationschedule/listslotemptybydate/${date}`);
    return response.data;
};