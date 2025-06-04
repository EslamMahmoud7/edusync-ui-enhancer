export enum AssessmentType {
  Midterm = 0,
  Final = 1,
  Coursework = 2,
  Quiz = 3,
  Project = 4,
  Attendance = 5,
  Participation = 6,
  Other = 7,
}

export enum AcademicRecordStatus {
  Provisional = 0,
  Final = 1,
}

export interface AcademicRecordDTO {
  id: string;
  studentId: string;
  studentFullName: string; 
  groupId: string;
  groupLabel: string;
  courseId: string;    
  courseCode: string; 
  courseTitle: string;
  instructorId?: string; 
  instructorFullName?: string;
  gradeValue: number;
  assessmentType: AssessmentType;
  term: string;
  status: AcademicRecordStatus;
  dateRecorded: string;
}

export interface UpdateAcademicRecordDTO {
  gradeValue?: number;
  assessmentType?: AssessmentType;
  term?: string;
  instructorId?: string | null;
  status?: AcademicRecordStatus;
  dateRecorded?: string;
}

export interface UploadAcademicRecordsCsvDTO {
  csvFile: File;
  groupId: string;
  term: string;
  assessmentType: AssessmentType;
  uploadingInstructorId?: string;
  defaultStatus?: AcademicRecordStatus;
}

export interface BulkAddAcademicRecordsResultDTO {
  totalRowsAttempted: number;
  successfullyAddedCount: number;
  errorMessages: string[];
}