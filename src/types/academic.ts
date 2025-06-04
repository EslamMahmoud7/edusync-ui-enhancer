
export interface AcademicRecordDTO {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  courseId: string;
  courseName: string;
  assessmentType: AssessmentType;
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: AcademicRecordStatus;
  submittedAt: string;
  gradedAt?: string;
  feedback?: string;
  createdAt: string;
}

export interface CreateAcademicRecordDTO {
  studentId: string;
  groupId: string;
  courseId: string;
  assessmentType: AssessmentType;
  marks: number;
  maxMarks: number;
  feedback?: string;
}

export interface UpdateAcademicRecordDTO {
  marks?: number;
  maxMarks?: number;
  grade?: string;
  status?: AcademicRecordStatus;
  feedback?: string;
}

export enum AssessmentType {
  ASSIGNMENT = 'Assignment',
  QUIZ = 'Quiz',
  EXAM = 'Exam',
  PROJECT = 'Project',
  MIDTERM = 'Midterm',
  FINAL = 'Final'
}

export enum AcademicRecordStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  GRADED = 'Graded'
}
