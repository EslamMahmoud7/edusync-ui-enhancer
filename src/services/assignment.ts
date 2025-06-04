
import api from './api';

export interface AssignmentDTO {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: number;
  gzroupId: string;
  groupLabel: string;
  courseTitle: string;
}

export interface CreateAssignmentDTO {
  title: string;
  description: string;
  dueDate: string;
  groupId: string;
}

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: number;
}

export const assignmentService = {
  getForStudent: async (studentId: string): Promise<AssignmentDTO[]> => {
    const response = await api.get(`/api/assignment/student/${studentId}`);
    return response.data;
  },

  getAll: async (): Promise<AssignmentDTO[]> => {
    const response = await api.get('/api/assignment');
    return response.data;
  },

  getById: async (id: string): Promise<AssignmentDTO> => {
    const response = await api.get(`/api/assignment/${id}`);
    return response.data;
  },

  create: async (data: CreateAssignmentDTO): Promise<AssignmentDTO> => {
    const response = await api.post('/api/assignment', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAssignmentDTO): Promise<AssignmentDTO> => {
    const response = await api.put(`/api/assignment/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/assignment/${id}`);
  }
};
