export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: number; // 1: Student, 2: Admin, 3: Instructor
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  institution?: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: number;
  phoneNumber?: string;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: number;
  isActive?: boolean;
  phoneNumber?: string;
}

export interface InstructorDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export interface BulkAddUsersResultDTO {
  totalRowsAttempted: number;
  successfullyAddedCount: number;
  errorMessages: string[];
}

export interface UploadUsersCsvDTO {
  csvFile: File;
  assignedRoleForAll: number;
}

export interface GroupEnrollmentDTO {
  studentId: string;
  groupId: string;
}

export interface BulkGroupEnrollmentDTO {
  groupId: string;
  studentIds: string[];
}

export interface BulkEnrollmentResultDTO {
  groupId: string;
  totalStudentsProcessed: number;
  studentsEnrolledSuccessfully: number;
  failedStudentIds: string[];
  errors: Record<string, string>;
}

export interface BulkGroupRemovalDTO {
  groupId: string;
  studentIds: string[];
}