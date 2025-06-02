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
  BulkEnrollmentResultDTO
} from '../types/user';

export const userService = {
  // Get all users
  getAll: async (role?: number): Promise<UserDTO[]> => {
    const params = role ? { roleFilter: role } : {};
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  // Get all students
  getStudents: async (): Promise<UserDTO[]> => {
    const response = await api.get('/api/users/students');
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
  },

  // Bulk upload users from CSV
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

  // Assign student to group
  assignToGroup: async (data: GroupEnrollmentDTO): Promise<void> => {
    await api.post('/api/course/assign-to-group', data);
  },

  // Bulk assign students to group
  assignToGroupBulk: async (data: BulkGroupEnrollmentDTO): Promise<BulkEnrollmentResultDTO> => {
    const response = await api.post('/api/course/assign-students-to-group-bulk', data);
    return response.data;
  }
};
