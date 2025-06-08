
export enum AssessmentType {
  Quiz = 0,
  Assignment = 1,
  Exam = 2,
  Project = 3,
  Participation = 4
}

export enum AcademicRecordStatus {
  Pending,      
  Provisional,  
  Final,        
  Graded,       
  Excused       
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
  year: number;
  semester: string;
  assessmentType: AssessmentType;
  grade: number;
  status: AcademicRecordStatus;
  term: string;
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
  errorMessages: string[];
}

export interface UploadAcademicRecordsCsvDTO {
  file: File;
}
