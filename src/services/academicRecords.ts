
import api from './api';
import { AcademicRecordDTO, CreateAcademicRecordDTO, UpdateAcademicRecordDTO } from '../types/academic';

export const academicRecordsService = {
  // Get all academic records
  getAll: async (): Promise<AcademicRecordDTO[]> => {
    const response = await api.get('/api/AcademicRecords');
    return response.data;
  },

  // Get academic records by group
  getByGroup: async (groupId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/AcademicRecords/group/${groupId}`);
    return response.data;
  },

  // Get academic records by student
  getByStudent: async (studentId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/AcademicRecords/student/${studentId}`);
    return response.data;
  },

  // Create new academic record
  create: async (data: CreateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.post('/api/AcademicRecords', data);
    return response.data;
  },

  // Add academic records from CSV
  addFromCsv: async (formData: FormData): Promise<{ message: string; recordsAdded: number }> => {
    const response = await api.post('/api/AcademicRecords/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update academic record
  update: async (id: string, data: UpdateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.put(`/api/AcademicRecords/${id}`, data);
    return response.data;
  },

  // Delete academic record
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/AcademicRecords/${id}`);
  }
};
