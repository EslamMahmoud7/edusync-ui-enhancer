
export interface AnnouncementDTO {
  id: string;
  title: string;
  message: string;
  dateCreated: string;
}

export interface CreateAnnouncementDTO {
  title: string;
  message: string;
}
