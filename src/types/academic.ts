
export interface AcademicRecordDTO {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupLabel: string;
  courseTitle: string;
  grade?: number;
  gradeValue: number;
  status: AcademicRecordStatus;
  assessmentType: AssessmentType;
  term: string;
  createdDate: string;
  updatedDate?: string;
  dateRecorded: string;
}

export interface CreateAcademicRecordDTO {
  studentId: string;
  groupId: string;
  grade?: number;
  gradeValue: number;
  status?: AcademicRecordStatus;
  assessmentType: AssessmentType;
  term: string;
}

export interface UpdateAcademicRecordDTO {
  grade?: number;
  gradeValue?: number;
  status?: AcademicRecordStatus;
  assessmentType?: AssessmentType;
  term?: string;
}

export interface UploadAcademicRecordsCsvDTO {
  file: File;
}

export interface BulkAddAcademicRecordsResultDTO {
  message: string;
  successfullyAddedCount: number;
  totalRowsAttempted: number;
  recordsAdded: number;
}

export enum AcademicRecordStatus {
  Pending = 0,
  Completed = 1,
  Graded = 2,
  Provisional = 3,
  Final = 4
}

export enum AssessmentType {
  Quiz = 0,
  Assignment = 1,
  Exam = 2,
  Project = 3,
  Midterm = 4,
  Final = 5
}
