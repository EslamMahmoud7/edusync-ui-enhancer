
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
  // Get materials by group ID
  getByGroupId: async (groupId: string): Promise<MaterialDTO[]> => {
    const response = await api.get(`/api/material/group/${groupId}`);
    return response.data;
  },

  // Create new material
  create: async (data: CreateMaterialDTO): Promise<MaterialDTO> => {
    const response = await api.post('/api/material', data);
    return response.data;
  },

  // Update material
  update: async (materialId: string, data: UpdateMaterialDTO): Promise<MaterialDTO> => {
    const response = await api.put(`/api/material/${materialId}`, data);
    return response.data;
  },

  // Delete material
  delete: async (materialId: string, requestingUserId: string): Promise<void> => {
    await api.delete(`/api/material/${materialId}?requestingUserId=${requestingUserId}`);
  }
};
