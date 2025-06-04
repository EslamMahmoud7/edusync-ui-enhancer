
import api from './api';
import type { CourseDTO, CreateCourseDTO, UpdateCourseDTO } from '../types/course';

export const courseService = {
  getAll: async (): Promise<CourseDTO[]> => {
    const response = await api.get('/api/course/all');
    return response.data;
  },

  getById: async (id: string): Promise<CourseDTO> => {
    const response = await api.get(`/api/course/${id}`);
    return response.data;
  },

  create: async (data: CreateCourseDTO): Promise<CourseDTO> => {
    const response = await api.post('/api/course', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCourseDTO): Promise<CourseDTO> => {
    const response = await api.put(`/api/course/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/course/${id}`);
  }
};
