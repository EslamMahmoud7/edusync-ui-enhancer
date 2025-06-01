
export interface AcademicRecordDTO {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupLabel: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  gradeValue: number;
  assessmentType: AssessmentType;
  term: string;
  status: AcademicRecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicRecordDTO {
  studentId: string;
  groupId: string;
  instructorId?: string;
  gradeValue: number;
  assessmentType: AssessmentType;
  term: string;
  status: AcademicRecordStatus;
}

export interface UpdateAcademicRecordDTO {
  gradeValue?: number;
  assessmentType?: AssessmentType;
  term?: string;
  status?: AcademicRecordStatus;
}

export enum AssessmentType {
  Quiz = 0,
  Assignment = 1,
  Midterm = 2,
  Final = 3,
  Project = 4
}

export enum AcademicRecordStatus {
  Pending = 0,
  Completed = 1,
  Graded = 2
}
