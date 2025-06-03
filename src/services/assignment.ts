
import api from './api';

export interface AssignmentDTO {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: number;
  groupId: string;
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
  // Get assignments for student
  getForStudent: async (studentId: string): Promise<AssignmentDTO[]> => {
    const response = await api.get(`/api/assignment/student/${studentId}`);
    return response.data;
  },

  // Get all assignments
  getAll: async (): Promise<AssignmentDTO[]> => {
    const response = await api.get('/api/assignment');
    return response.data;
  },

  // Get assignment by ID
  getById: async (id: string): Promise<AssignmentDTO> => {
    const response = await api.get(`/api/assignment/${id}`);
    return response.data;
  },

  // Create new assignment
  create: async (data: CreateAssignmentDTO): Promise<AssignmentDTO> => {
    const response = await api.post('/api/assignment', data);
    return response.data;
  },

  // Update assignment
  update: async (id: string, data: UpdateAssignmentDTO): Promise<AssignmentDTO> => {
    const response = await api.put(`/api/assignment/${id}`, data);
    return response.data;
  },

  // Delete assignment
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/assignment/${id}`);
  }
};
