
export interface AcademicRecordDTO {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  semester: string;
  year: number;
  grade: string;
  gpa: number;
  creditHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicRecordDTO {
  studentId: string;
  courseId: string;
  semester: string;
  year: number;
  grade: string;
  gpa: number;
  creditHours: number;
}

export interface UpdateAcademicRecordDTO {
  grade?: string;
  gpa?: number;
  creditHours?: number;
}

export interface BulkAddAcademicRecordsResultDTO {
  success: boolean;
  message: string;
  successfullyAddedCount: number;
  totalRowsAttempted: number;
  errors?: string[];
}
