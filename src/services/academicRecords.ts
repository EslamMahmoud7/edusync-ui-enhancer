
import api from './api';
import type { AcademicRecordDTO, CreateAcademicRecordDTO, UpdateAcademicRecordDTO } from '../types/academic';

export const academicRecordsService = {
  // Get all academic records (Admin)
  getAll: async (): Promise<AcademicRecordDTO[]> => {
    const response = await api.get('/api/academicrecord');
    return response.data;
  },

  // Get records by group (Instructor)
  getByGroup: async (groupId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/academicrecord/group/${groupId}`);
    return response.data;
  },

  // Get records by student
  getByStudent: async (studentId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/academicrecord/student/${studentId}`);
    return response.data;
  },

  // Create new academic record
  create: async (data: CreateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.post('/api/academicrecord', data);
    return response.data;
  },

  // Update academic record
  update: async (id: string, data: UpdateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.put(`/api/academicrecord/${id}`, data);
    return response.data;
  },

  // Delete academic record
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/academicrecord/${id}`);
  }
};
