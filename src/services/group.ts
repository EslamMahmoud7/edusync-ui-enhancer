
import api from './api';
import type { GroupDTO, CreateGroupDTO, UpdateGroupDTO, StudentInGroupDTO, BulkGroupEnrollmentDTO } from '../types/group';

export const groupService = {
  // Get all groups
  getAll: async (): Promise<GroupDTO[]> => {
    const response = await api.get('/api/group');
    return response.data;
  },

  // Get groups by instructor
  getByInstructor: async (instructorId: string): Promise<GroupDTO[]> => {
    const response = await api.get(`/api/group/instructor/${instructorId}`);
    return response.data;
  },

  // Get students in group
  getStudents: async (groupId: string): Promise<StudentInGroupDTO[]> => {
    const response = await api.get(`/api/group/${groupId}/students`);
    return response.data;
  },

  // Create new group
  create: async (data: CreateGroupDTO): Promise<GroupDTO> => {
    const response = await api.post('/api/group', data);
    return response.data;
  },

  // Update group
  update: async (id: string, data: UpdateGroupDTO): Promise<GroupDTO> => {
    const response = await api.put(`/api/group/${id}`, data);
    return response.data;
  },

  // Delete group
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/group/${id}`);
  },

  // Assign student to group
  assignStudent: async (groupId: string, studentId: string): Promise<void> => {
    await api.post('/api/course/assign-to-group', { groupId, studentId });
  },

  // Bulk assign students to group
  assignStudentsBulk: async (data: BulkGroupEnrollmentDTO): Promise<void> => {
    await api.post('/api/course/assign-students-to-group-bulk', data);
  }
};
