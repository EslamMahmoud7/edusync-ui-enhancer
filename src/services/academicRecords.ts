
import api from './api';
import type { AcademicRecordDTO, CreateAcademicRecordDTO, UpdateAcademicRecordDTO } from '../types/academic';

export const academicRecordsService = {
  getAll: async (): Promise<AcademicRecordDTO[]> => {
    const response = await api.get('/api/academic-records');
    return response.data;
  },

  getByGroup: async (groupId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/academic-records/group/${groupId}`);
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/academic-records/student/${studentId}`);
    return response.data;
  },

  create: async (data: CreateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.post('/api/academic-records', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.put(`/api/academic-records/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/academic-records/${id}`);
  },

  addFromCsv: async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/api/academic-records/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
