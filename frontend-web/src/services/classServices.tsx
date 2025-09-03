import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.config";
import { toast } from "react-toastify";
import { CreateClassData, UpdateClassData } from "../types/class";

export const createClass = async (data: CreateClassData) => {
  try {
    const response = await defaultAxiosInstance.post("/api/class", data);
    toast.success("Create class successful");
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Failed to create class");
    }
    throw error;
  }
};

/**
 * Get all classes. If `status` is provided, filter by status.
 * - minhne version: no param, returns [] on error
 * - main version : requires status
 * => Hợp nhất: param tùy chọn + trả [] khi lỗi
 */
export const getAllClasses = async (status?: string) => {
  try {
    const url = status ? `/api/class?status=${encodeURIComponent(status)}` : "/api/class";
    const response = await axiosWithoutLoading.get(url);
    return response.data ?? [];
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
};

export const getClassById = async (id: string) => {
  const response = await axiosWithoutLoading.get(`/api/class/${id}`);
  return response.data;
};

export const updateClass = async (id: string, data: UpdateClassData) => {
  try {
    const response = await defaultAxiosInstance.put(`/api/class/${id}`, data);
    toast.success("Update class successful");
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Failed to update class");
    }
    throw error;
  }
};

/** Giữ hàm deleteClass từ nhánh minhne */
export const deleteClass = async (id: string) => {
  try {
    const response = await defaultAxiosInstance.delete(`/api/class/${id}`);
    toast.success("Delete class successful");
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Failed to delete class");
    }
    throw error;
  }
};

/** Giữ hàm getClassByLecturerId từ nhánh main (đồng hoạt động cùng deleteClass) */
export const getClassByLecturerId = async (lecturerId: string) => {
  const response = await axiosWithoutLoading.get(`/api/class/lecturer/${lecturerId}`);
  return response.data;
};

export const updateClassStatus = async (id: string, status: string) => {
  try {
    const response = await defaultAxiosInstance.put(`/api/class/${id}/status`, { status });
    toast.success("Update class status successful");
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Failed to update class status");
    }
    throw error;
  }
};

export const addScheduleForClass = async (data: { classId: number; scheduleTypeId: number }) => {
  try {
    const response = await defaultAxiosInstance.post(`/api/class/addscheduleforclass`, data);
    toast.success("Create schedule for class successful");
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Failed to create schedule for class");
    }
    throw error;
  }
};

export const getLabByClassId = async (classId: string) => {
  const response = await axiosWithoutLoading.get(`/api/class/${classId}/labs`);
  return response.data;
};
