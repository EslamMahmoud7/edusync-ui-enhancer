
import api from './api';
import { AcademicRecordDTO, CreateAcademicRecordDTO, BulkAddAcademicRecordsResultDTO, AcademicRecordFilters } from '../types/academic';

export const academicRecordsService = {
  getAll: async (filters?: AcademicRecordFilters): Promise<AcademicRecordDTO[]> => {
    const response = await api.get('/api/AcademicRecord', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<AcademicRecordDTO> => {
    const response = await api.get(`/api/AcademicRecord/${id}`);
    return response.data;
  },

  getByStudentId: async (studentId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/AcademicRecord/student/${studentId}`);
    return response.data;
  },

  create: async (data: CreateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.post('/api/AcademicRecord', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAcademicRecordDTO>): Promise<AcademicRecordDTO> => {
    const response = await api.put(`/api/AcademicRecord/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/AcademicRecord/${id}`);
  },

  bulkAdd: async (file: File): Promise<BulkAddAcademicRecordsResultDTO> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/AcademicRecord/bulk-add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
