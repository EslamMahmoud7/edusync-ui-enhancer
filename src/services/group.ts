
import api from './api';
import type { GroupDTO, CreateGroupDTO, UpdateGroupDTO, StudentInGroupDTO, BulkGroupEnrollmentDTO } from '../types/group';

export const groupService = {
  getAll: async (): Promise<GroupDTO[]> => {
    const response = await api.get('/api/group');
    return response.data;
  },

  getByInstructor: async (instructorId: string): Promise<GroupDTO[]> => {
    const response = await api.get(`/api/group/instructor/${instructorId}`);
    return response.data;
  },

  getInstructorGroups: async (): Promise<GroupDTO[]> => {
    const response = await api.get('/api/group/my-groups');
    return response.data;
  },

  getStudents: async (groupId: string): Promise<StudentInGroupDTO[]> => {
    const response = await api.get(`/api/group/${groupId}/students`);
    return response.data;
  },

  create: async (data: CreateGroupDTO): Promise<GroupDTO> => {
    const response = await api.post('/api/group', data);
    return response.data;
  },

  update: async (id: string, data: UpdateGroupDTO): Promise<GroupDTO> => {
    const response = await api.put(`/api/group/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/group/${id}`);
  },

  assignStudentsBulk: async (data: BulkGroupEnrollmentDTO): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/api/group/assign-students-bulk', data);
    return response.data;
  }
};
