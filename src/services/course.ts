
import api from './api';
import type { CourseDTO, CreateCourseDTO, UpdateCourseDTO } from '../types/course';

export const courseService = {
  // Get all courses
  getAll: async (): Promise<CourseDTO[]> => {
    const response = await api.get('/api/course/all');
    return response.data;
  },

  // Get course by ID
  getById: async (id: string): Promise<CourseDTO> => {
    const response = await api.get(`/api/course/${id}`);
    return response.data;
  },

  // Create new course
  create: async (data: CreateCourseDTO): Promise<CourseDTO> => {
    const response = await api.post('/api/course', data);
    return response.data;
  },

  // Update course
  update: async (id: string, data: UpdateCourseDTO): Promise<CourseDTO> => {
    const response = await api.put(`/api/course/${id}`, data);
    return response.data;
  },

  // Delete course
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/course/${id}`);
  }
};
