
import api from './api';
import type { UserDTO, CreateUserDTO, UpdateUserDTO, InstructorDTO } from '../types/user';

export const userService = {
  // Get all users
  getAll: async (role?: number): Promise<UserDTO[]> => {
    const params = role ? { role } : {};
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<UserDTO> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Get all instructors
  getInstructors: async (): Promise<InstructorDTO[]> => {
    const response = await api.get('/api/instructor');
    return response.data;
  },

  // Create new user
  create: async (data: CreateUserDTO): Promise<UserDTO> => {
    const response = await api.post('/api/users', data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserDTO): Promise<UserDTO> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  }
};
