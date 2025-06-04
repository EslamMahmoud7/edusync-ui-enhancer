
import api from './api';
import type { AnnouncementDTO, CreateAnnouncementDTO } from '../types/announcement';

export const announcementService = {
  getAll: async (): Promise<AnnouncementDTO[]> => {
    const response = await api.get('/api/announcement');
    return response.data;
  },

  create: async (data: CreateAnnouncementDTO): Promise<AnnouncementDTO> => {
    const response = await api.post('/api/announcement', data);
    return response.data;
  }
};
