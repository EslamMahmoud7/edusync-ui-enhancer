
import apiClient from './api';
import type { 
  AcademicRecordDTO, 
  UpdateAcademicRecordDTO,
  UploadAcademicRecordsCsvDTO,
  BulkAddAcademicRecordsResultDTO 
} from '../types/academic';

export const academicRecordsService = {
getAll: async (): Promise<AcademicRecordDTO[]> => {
  const response = await apiClient.get('/api/AcademicRecord');
  return response.data;
},

getByGroup: async (groupId: string): Promise<AcademicRecordDTO[]> => {
  const response = await apiClient.get(`/api/academicrecord/group/${groupId}`);
  return response.data;
},

getByStudent: async (studentId: string): Promise<AcademicRecordDTO[]> => {
  const response = await apiClient.get(`/api/academicrecord/student/${studentId}`);
  return response.data;
},

addFromCsv: async (formData: FormData): Promise<BulkAddAcademicRecordsResultDTO> => {
  const response = await apiClient.post('/api/academicrecord/bulk-upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},

update: async (id: string, data: UpdateAcademicRecordDTO): Promise<AcademicRecordDTO> => {
  const response = await apiClient.put(`/api/academicrecord/${id}`, data);
  return response.data;
},

delete: async (id: string): Promise<void> => {
  await apiClient.delete(`/api/academicrecord/${id}`);
}
};