
import api from './api';
import type { AcademicRecordDTO, CreateAcademicRecordDTO, UpdateAcademicRecordDTO } from '../types/academic';

export const academicRecordsService = {
  getAll: async (): Promise<AcademicRecordDTO[]> => {
    const response = await api.get('/api/academicrecord');
    return response.data;
  },

  getByGroup: async (groupId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/academicrecord/group/${groupId}`);
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/academicrecord/student/${studentId}`);
    return response.data;
  },

  create: async (data: CreateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.post('/api/academicrecord', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.put(`/api/academicrecord/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/academicrecord/${id}`);
  },

  addFromCsv: async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/api/academicrecord/bulk-upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
