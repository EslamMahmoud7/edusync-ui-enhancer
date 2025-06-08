
import api from './api';
import type { 
  AcademicRecordDTO, 
  CreateAcademicRecordDTO, 
  UpdateAcademicRecordDTO,
  BulkAddAcademicRecordsResultDTO 
} from '../types/academic';

export const academicRecordsService = {
  getAll: async (): Promise<AcademicRecordDTO[]> => {
    const response = await api.get('/api/AcademicRecord');
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

  getByStudent: async (studentId: string): Promise<AcademicRecordDTO[]> => {
    const response = await api.get(`/api/AcademicRecord/student/${studentId}`);
    return response.data;
  },

  create: async (data: CreateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
    const response = await api.post('/api/AcademicRecord', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addFromCsv: async (file: File): Promise<BulkAddAcademicRecordsResultDTO> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/AcademicRecord/bulk-add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
