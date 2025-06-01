// user.ts
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: number;       // 1: Student, 2: Admin, 3: Instructor
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: number;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: number;
  isActive?: boolean;
}

// instructor.ts
export interface InstructorDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

// group.ts
export interface GroupDTO {
  id: string;
  label: string;
  courseId: string;
  courseTitle: string;
  courseDescription?: string;
  courseCredits?: number;
  courseResourceLink?: string | null;
  courseLevel?: number;
  startTime: string;
  endTime: string;   
  location: string;
  maxStudents?: number;
  numberOfStudents: number;
  instructor: InstructorDTO | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGroupDTO {
  label: string;
  courseId: string;
  instructorId?: string;
  startTime: string;
  endTime: string; 
  location: string;
  maxStudents: number;
}

export interface UpdateGroupDTO {
  label?: string;
  courseId?: string;
  instructorId?: string | null;
  startTime?: string;
  endTime?: string;
  location?: string;
  maxStudents?: number;
}

export interface StudentInGroupDTO {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrolledAt: string;
}

export interface BulkGroupEnrollmentDTO {
  groupId: string;
  studentIds: string[];
}
