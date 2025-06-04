
import api from './api';

export interface MaterialDTO {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  type: number; // 0: Document, 1: Video, 2: Other
  groupId: string;
  groupLabel: string;
  courseTitle: string;
  uploadedById: string;
  uploadedByName: string;
  dateUploaded: string;
}

export interface CreateMaterialDTO {
  title: string;
  description: string;
  fileUrl: string;
  type: number;
  groupId: string;
  uploadingInstructorId: string;
}

export interface UpdateMaterialDTO {
  title?: string;
  description?: string;
  fileUrl?: string;
  type?: number;
  updatingInstructorId: string;
}

export const materialService = {
  getByGroupId: async (groupId: string): Promise<MaterialDTO[]> => {
    const response = await api.get(`/api/material/group/${groupId}`);
    return response.data;
  },

  create: async (data: CreateMaterialDTO): Promise<MaterialDTO> => {
    const response = await api.post('/api/material', data);
    return response.data;
  },

  update: async (materialId: string, data: UpdateMaterialDTO): Promise<MaterialDTO> => {
    const response = await api.put(`/api/material/${materialId}`, data);
    return response.data;
  },

  delete: async (materialId: string): Promise<void> => {
    await api.delete(`/api/material/${materialId}`);
  }
};
