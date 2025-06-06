import api from './api';
import type { 
  UserDTO, 
  CreateUserDTO, 
  UpdateUserDTO, 
  InstructorDTO, 
  BulkAddUsersResultDTO, 
  UploadUsersCsvDTO,
  GroupEnrollmentDTO,
  BulkGroupEnrollmentDTO,
  BulkEnrollmentResultDTO,
  BulkGroupRemovalDTO 
} from '../types/user';

export const userService = {
  getAll: async (role?: number): Promise<UserDTO[]> => {
    const params = role ? { roleFilter: role } : {};
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  getStudents: async (): Promise<UserDTO[]> => {
    const response = await api.get('/api/users/students');
    return response.data;
  },

  getById: async (id: string): Promise<UserDTO> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  getInstructors: async (): Promise<InstructorDTO[]> => {
    const response = await api.get('/api/instructor');
    return response.data;
  },

  create: async (data: CreateUserDTO): Promise<UserDTO> => {
    const response = await api.post('/api/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDTO): Promise<UserDTO> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },

  uploadCsv: async (data: UploadUsersCsvDTO): Promise<BulkAddUsersResultDTO> => {
    const formData = new FormData();
    formData.append('csvFile', data.csvFile);
    formData.append('assignedRoleForAll', data.assignedRoleForAll.toString());
    
    const response = await api.post('/api/users/bulk-upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  assignToGroup: async (data: GroupEnrollmentDTO): Promise<void> => {
    await api.post('/api/course/assign-to-group', data);
  },

  assignToGroupBulk: async (data: BulkGroupEnrollmentDTO): Promise<BulkEnrollmentResultDTO> => {
    const response = await api.post('/api/course/assign-students-to-group-bulk', data);
    return response.data;
  },

  removeFromGroupBulk: async (data: BulkGroupRemovalDTO): Promise<void> => {
    const requestBody = { studentIds: data.studentIds };
    
    await api.post(`/api/Group/${data.groupId}/remove-students`, requestBody);
  }
};