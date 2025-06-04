
export interface AcademicRecordDTO {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupLabel: string;
  courseTitle: string;
  grade?: number;
  status: AcademicRecordStatus;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateAcademicRecordDTO {
  studentId: string;
  groupId: string;
  grade?: number;
  status?: AcademicRecordStatus;
}

export interface UpdateAcademicRecordDTO {
  grade?: number;
  status?: AcademicRecordStatus;
}

export enum AcademicRecordStatus {
  Pending = 0,
  Completed = 1,
  Graded = 2
}
