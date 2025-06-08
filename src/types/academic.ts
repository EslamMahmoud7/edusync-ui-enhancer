
export enum AssessmentType {
  Quiz = 0,
  Assignment = 1,
  Exam = 2,
  Project = 3,
  Participation = 4
}

export enum AcademicRecordStatus {
  Pending = 0,
  Completed = 1,
  Graded = 2
}

export interface AcademicRecordDTO {
  id: string;
  studentId: string;
  studentName: string;
  studentFullName: string;
  courseId: string;
  courseTitle: string;
  groupId: string;
  groupLabel: string;
  semester: string;
  year: number;
  grade: string;
  gpa: number;
  creditHours: number;
  gradeValue: number;
  assessmentType: AssessmentType;
  term: string;
  status: AcademicRecordStatus;
  dateRecorded: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicRecordDTO {
  studentId: string;
  courseId: string;
  groupId: string;
  semester: string;
  year: number;
  grade: string;
  gpa: number;
  creditHours: number;
  gradeValue: number;
  assessmentType: AssessmentType;
  term: string;
  status: AcademicRecordStatus;
}

export interface UpdateAcademicRecordDTO {
  grade?: string;
  gpa?: number;
  creditHours?: number;
  gradeValue?: number;
  assessmentType?: AssessmentType;
  term?: string;
  status?: AcademicRecordStatus;
}

export interface BulkAddAcademicRecordsResultDTO {
  success: boolean;
  message: string;
  successfullyAddedCount: number;
  totalRowsAttempted: number;
  errors?: string[];
  errorMessages?: string[];
}

export interface UploadAcademicRecordsCsvDTO {
  file: File;
}
